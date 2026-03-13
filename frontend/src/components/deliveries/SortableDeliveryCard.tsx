import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CardContent, { type CardProps } from "./CardContent";

export default function SortableDeliveryCard({
  delivery,
  expandedOrderId,
  setExpandedOrderId,
  formatTime,
  formatDate,
  getVehicleIcon,
  completingId,
  handleComplete,
  startingId,
  handleStart,
}: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: delivery.activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 border-slate-800 rounded-lg p-6 transition-shadow h-full ${isDragging ? "shadow-lg" : "hover:shadow-md"}`}
    >
      <div className="flex gap-3">
        <button
          {...attributes}
          {...listeners}
          className="touch-none p-0 bg-transparent border-none cursor-grab active:cursor-grabbing self-start mt-1"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <CardContent
            delivery={delivery}
            expandedOrderId={expandedOrderId}
            setExpandedOrderId={setExpandedOrderId}
            formatTime={formatTime}
            formatDate={formatDate}
            getVehicleIcon={getVehicleIcon}
            completingId={completingId}
            handleComplete={handleComplete}
            startingId={startingId}
            handleStart={handleStart}
          />
        </div>
      </div>
    </div>
  );
}
