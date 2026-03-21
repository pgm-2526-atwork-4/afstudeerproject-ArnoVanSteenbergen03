import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock } = vi.hoisted(() => ({
  dbMock: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/config/database", () => ({
  db: dbMock,
}));

vi.mock("@/middleware/auth", () => ({
  requireAuth: (_req: unknown, _res: unknown, next: () => void) => next(),
  requirePermission:
    () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

vi.mock("@/services/autoAssign", () => ({
  findOpenCenter: vi.fn(),
}));

import orderRouter from "@/routes/orderRoutes";
import deliveryRouter from "@/routes/deliveryRoutes";
import chatRouter from "@/routes/chatRoutes";
import { findOpenCenter } from "@/services/autoAssign";

function buildApp(router: express.Router, userId: string) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).user = { id: userId };
    (req as any).isAuthenticated = () => true;
    next();
  });
  app.use(router);
  return app;
}

describe("Minimal lifecycle flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create order auto-assigns an open center", async () => {
    const mockedFindOpenCenter = vi.mocked(findOpenCenter);
    mockedFindOpenCenter.mockResolvedValue("center-1");

    const selectWhereMock = vi
      .fn()
      .mockResolvedValueOnce([{ id: "vehicle-1" }])
      .mockResolvedValueOnce([]);
    const selectFromMock = vi.fn(() => ({ where: selectWhereMock }));
    dbMock.select.mockReturnValue({ from: selectFromMock });

    const insertReturningMock = vi
      .fn()
      .mockResolvedValueOnce([{ id: "activity-1", assignedCenterId: "center-1" }])
      .mockResolvedValueOnce([{ id: "collection-1" }])
      .mockResolvedValueOnce([{ id: "good-1" }]);
    const insertValuesMock = vi.fn((value: unknown) => ({ returning: insertReturningMock }));
    dbMock.insert.mockReturnValue({ values: insertValuesMock });

    const app = buildApp(orderRouter, "provider-1");
    const response = await request(app).post("/").send({
      location: "Warehouse A",
      vehicleId: "vehicle-1",
      orderTime: "2026-03-21T10:00:00.000Z",
      orderType: "single",
      goods: [
        {
          category: "Vegetables",
          name: "Carrots",
          quantity: 5,
          unit: "kg",
          packageIncluded: false,
        },
      ],
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toContain("1 order(s) created successfully");
    expect(mockedFindOpenCenter).toHaveBeenCalledTimes(1);
    expect(insertValuesMock).toHaveBeenCalled();

    const activityInsert = insertValuesMock.mock.calls[0][0] as {
      assignedCenterId: string;
    };
    expect(activityInsert.assignedCenterId).toBe("center-1");
  });

  it("claiming a delivery assigns driver and marks accepted", async () => {
    const selectWhereMock = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: "activity-1",
          providerId: "provider-1",
          status: "requested",
          assignedDriver: null,
        },
      ])
      .mockResolvedValueOnce([]);
    const selectFromMock = vi.fn(() => ({ where: selectWhereMock }));
    dbMock.select.mockReturnValue({ from: selectFromMock });

    const updateReturningMock = vi.fn().mockResolvedValueOnce([
      { id: "activity-1", status: "accepted", assignedDriver: "driver-1" },
    ]);
    const updateWhereMock = vi.fn(() => ({ returning: updateReturningMock }));
    const updateSetMock = vi.fn((value: unknown) => ({ where: updateWhereMock }));
    dbMock.update.mockReturnValue({ set: updateSetMock });

    const onConflictDoNothingMock = vi.fn().mockResolvedValue(undefined);
    const insertValuesMock = vi.fn(() => ({
      onConflictDoNothing: onConflictDoNothingMock,
    }));
    dbMock.insert.mockReturnValue({ values: insertValuesMock });

    const app = buildApp(deliveryRouter, "driver-1");
    const response = await request(app).patch("/activity-1/accept").send();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Delivery accepted");
    expect(updateSetMock).toHaveBeenCalled();

    const updatePayload = updateSetMock.mock.calls[0][0] as {
      assignedDriver: string;
      status: string;
    };
    expect(updatePayload.assignedDriver).toBe("driver-1");
    expect(updatePayload.status).toBe("accepted");
  });

  it("sending completion message posts to the supplier channel", async () => {
    const selectWhereMock = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: "activity-1",
          providerId: "provider-1",
          assignedCenterId: "center-1",
        },
      ])
      .mockResolvedValueOnce([{ id: "supplier-place-1" }])
      .mockResolvedValueOnce([{ id: "supplier-channel-1", type: "supplier" }])
      .mockResolvedValueOnce([
        {
          id: "driver-1",
          firstname: "Test",
          lastname: "Driver",
          profileImage: null,
        },
      ]);
    const selectFromMock = vi.fn(() => ({ where: selectWhereMock }));
    dbMock.select.mockReturnValue({ from: selectFromMock });

    const insertReturningMock = vi.fn().mockResolvedValueOnce([
      {
        id: "message-1",
        channelId: "supplier-channel-1",
        userId: "driver-1",
        body: "Delivery completed successfully",
      },
    ]);
    const insertValuesMock = vi.fn((value: unknown) => ({ returning: insertReturningMock }));
    dbMock.insert.mockReturnValue({ values: insertValuesMock });

    const app = buildApp(chatRouter, "driver-1");
    const response = await request(app).post("/send-completion-message").send({
      activityId: "activity-1",
      status: "completed",
    });

    expect(response.status).toBe(201);
    expect(insertValuesMock).toHaveBeenCalled();

    const insertedMessage = insertValuesMock.mock.calls[0][0] as {
      body: string;
    };
    expect(insertedMessage.body).toContain("Delivery completed successfully");
  });

  it("completing a delivery updates status from in_progress to completed", async () => {
    const selectWhereMock = vi.fn().mockResolvedValueOnce([
      {
        id: "activity-1",
        status: "in_progress",
        details: { startMileage: 101 },
      },
    ]);
    const selectFromMock = vi.fn(() => ({ where: selectWhereMock }));
    dbMock.select.mockReturnValue({ from: selectFromMock });

    const updateReturningMock = vi.fn().mockResolvedValueOnce([
      {
        id: "activity-1",
        status: "completed",
        details: { startMileage: 101, endMileage: 121 },
      },
    ]);
    const updateWhereMock = vi.fn(() => ({ returning: updateReturningMock }));
    const updateSetMock = vi.fn((value: unknown) => ({ where: updateWhereMock }));
    dbMock.update.mockReturnValue({ set: updateSetMock });

    const app = buildApp(deliveryRouter, "driver-1");
    const response = await request(app)
      .patch("/activity-1/status")
      .send({ status: "completed", completionData: { endMileage: 121 } });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Delivery status updated");
    expect(updateSetMock).toHaveBeenCalled();

    const updatePayload = updateSetMock.mock.calls[0][0] as {
      status: string;
      details: { endMileage: number };
    };
    expect(updatePayload.status).toBe("completed");
    expect(updatePayload.details.endMileage).toBe(121);
  });
});
