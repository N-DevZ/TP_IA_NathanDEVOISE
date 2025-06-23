
import React from 'react';
import './CallHistory.css';
import { FaPhoneVolume } from 'react-icons/fa';
import { 
  MdCallMade, 
  MdCallReceived, 
  MdCallMissedOutgoing, 
  MdCallMissed 
} from 'react-icons/md';

function CallHistory({ history, username, t }) {
  const getCallTypeIcon = (call) => {
    const isOutgoing = call.caller_id_number === username;
    if (call.hangup_cause === 'NORMAL_CLEARING' && call.duration > 0) {
      return isOutgoing ? 
        <MdCallMade className="outgoing success" /> : 
        <MdCallReceived className="incoming success" />;
    } else if (call.hangup_cause === 'NO_ANSWER' || call.duration === 0) {
      return isOutgoing ? 
        <MdCallMissedOutgoing className="missed outgoing" /> : 
        <MdCallMissed className="missed incoming" />;
    } else {
      return isOutgoing ?
        <MdCallMissedOutgoing className="failed outgoing" /> :
        <MdCallMissed className="failed incoming" />;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusClass = (call) => {
    const isOutgoing = call.caller_id_number === username;
    if (call.hangup_cause === 'NORMAL_CLEARING' && call.duration > 0) {
      return isOutgoing ? 'outgoing success' : 'incoming success';
    } else if (call.hangup_cause === 'NO_ANSWER' || call.duration === 0) {
      return isOutgoing ? 'missed outgoing' : 'missed incoming';
    } else {
      return isOutgoing ? 'failed outgoing' : 'failed incoming';
    }
  };

  const groupCallsByDate = (calls) => {
    const grouped = {};
    calls.forEach(call => {
      const date = new Date(call.start_stamp).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(call);
    });
    return grouped;
  };

  const groupedCalls = groupCallsByDate(history);

  return (
    <div className="call-history-container">
      <h2 className="call-history-header">{t('callHistory')}</h2>
      <div className="call-history-content">
        {Object.entries(groupedCalls).map(([date, calls]) => (
          <div key={date} className="call-group">
            <div className="call-date">{date}</div>
            <ul className="call-list">
              {calls.map((call) => (
                <li key={call.uuid} className={`call-item ${getCallStatusClass(call)}`}>
                  <div className="call-icon-container">
                    {getCallTypeIcon(call)}
                  </div>
                  <div className="call-details">
                    <span className="call-number">
                      {call.caller_id_number === username ? call.destination_number : call.caller_id_number}
                    </span>
                    <span className="call-time">
                      {new Date(call.start_stamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="call-duration">
                    {call.duration > 0 ? (
                      <>
                        <FaPhoneVolume className="duration-icon success" />
                        {formatDuration(call.duration)}
                      </>
                    ) : (
                      <span className="no-duration">{t('Missed')}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CallHistory;