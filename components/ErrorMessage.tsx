interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div style={{
      backgroundColor: '#ffebee',
      color: '#c62828',
      padding: '15px',
      borderRadius: '10px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#c62828',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '0 10px'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

