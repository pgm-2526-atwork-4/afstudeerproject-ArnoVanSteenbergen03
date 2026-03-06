import CardContent, { type CardProps } from "./CardContent";

interface OpenCardProps extends CardProps {
  acceptingId: string | null;
  handleAccept: (id: string) => void;
}

export default function DeliveryCard({
  delivery,
  expandedOrderId,
  setExpandedOrderId,
  acceptingId,
  handleAccept,
  formatTime,
  getVehicleIcon,
}: OpenCardProps) {
  return (
    <div className="bg-white border-2 border-slate-800 rounded-lg p-6 hover:shadow-md transition-shadow">
      <CardContent
        delivery={delivery}
        expandedOrderId={expandedOrderId}
        setExpandedOrderId={setExpandedOrderId}
        formatTime={formatTime}
        getVehicleIcon={getVehicleIcon}
        acceptingId={acceptingId}
        handleAccept={handleAccept}
        isOpen
      />
    </div>
  );
}
