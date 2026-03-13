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
  formatDate,
  getVehicleIcon,
}: OpenCardProps) {
  return (
    <div className="bg-white border-2 border-slate-800 rounded-lg p-6 hover:shadow-md transition-shadow h-full">
      <CardContent
        delivery={delivery}
        expandedOrderId={expandedOrderId}
        setExpandedOrderId={setExpandedOrderId}
        formatTime={formatTime}
        formatDate={formatDate}
        getVehicleIcon={getVehicleIcon}
        acceptingId={acceptingId}
        handleAccept={handleAccept}
        isOpen
      />
    </div>
  );
}
