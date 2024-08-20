export function formatTimestamp(timestamp) {
    // Create a Date object from the timestamp
    const date = new Date(timestamp);
  
    // Options for formatting
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'long'
    };
  
    // Format the date
    const formattedDate = date.toLocaleDateString('en-US', options);
  
    return formattedDate;
  }