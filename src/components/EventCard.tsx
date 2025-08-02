"use client";

import React from "react";
import { Event } from "@/types";
import { MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventDuration = () => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h${diffMinutes > 0 ? ` ${diffMinutes}m` : ""}`;
    }
    return `${diffMinutes}m`;
  };

  return (
    <div
      className="border border-green-300 bg-green-50 rounded-md p-2 text-xs transition-all hover:shadow-md hover:bg-green-100 relative cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1">
          <ClockIcon className="h-3 w-3 text-green-600" />
          <span className="font-medium text-green-700 text-xs">{formatTime(event.startTime)}</span>
        </div>
        <span className="text-xs text-green-600 bg-green-200 px-1 py-0.5 rounded">
          {getEventDuration()}
        </span>
      </div>

      {/* Título */}
      <h4 className="font-medium text-sm text-green-800 leading-tight">{event.title}</h4>

      {/* Info compacta en una línea */}
      <div className="flex items-center gap-2 mt-1 text-xs text-green-600">
        {event.location && (
          <div className="flex items-center gap-0.5">
            <MapPinIcon className="h-3 w-3" />
            <span className="truncate max-w-[60px]">{event.location}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
