import React from 'react';
import './CallHistory.css';

function CallHistory({ history, username }) {
  const getCallTypeIcon = (call) => {
    if (call.hangup_cause === 'NORMAL_CLEARING') {
      return call.caller_id_number === username ? '📞↗️' : '📞↘️';
    } else if (call.hangup_cause === 'NO_ANSWER') {
      return '📞❌';
    } else {
      return '📞❓';
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="call-history">
      <h3>Call History</h3>
      <ul>
        {history.map((call) => (
          <li key={call.uuid} className={`call-item ${call.hangup_cause.toLowerCase()}`}>
            <span className="call-icon">{getCallTypeIcon(call)}</span>
            <span className="call-number">
              {call.caller_id_number === username ? call.destination_number : call.caller_id_number}
            </span>
            <span className="call-time">{new Date(call.start_stamp).toLocaleString()}</span>
            <span className="call-duration">{formatDuration(call.duration)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CallHistory;