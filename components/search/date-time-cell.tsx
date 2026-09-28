import React from 'react';
import { formatDate, formatTime } from './search-data';

// Date/time table cell shared by the search results tables and the modal's
// parent/child record tables.
export const DateTimeCell: React.FC<{ source: any }> = ({ source }) => {
  const startDate = formatDate(source.startDate);
  const startTime = formatTime(source.startTime);
  const endDate = formatDate(source.endDate);
  const endTime = formatTime(source.endTime);
  const date = formatDate(source.date);
  const time = formatTime(source.time);

  const showEndDate = endDate && endDate !== startDate;
  const showEndTime = endTime && endTime !== startTime;

  return (
    <td className="align-top">
      {(startDate || startTime || endDate || endTime) ? (
        <>
          {(startDate || endDate) && (
            <>
              <b>Date:</b><br/>
              {startDate && showEndDate ? `${startDate} – ${endDate}` : (startDate || endDate)}
              <br/>
            </>
          )}
          {(startTime || showEndTime) && (
            <>
              <b>Time:</b><br/>
              {startTime && showEndTime ? `${startTime} – ${endTime}` : (startTime || endTime)}
              <br/>
            </>
          )}
        </>
      ) : (date || time) ? (
        <>
          {date && <><b>Date:</b><br/>{date}<br/></>}
          {time && <><b>Time:</b><br/>{time}<br/></>}
        </>
      ) : (
        <span className="text-gray-500">—</span>
      )}
    </td>
  );
};

