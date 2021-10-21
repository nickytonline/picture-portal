export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> =
  ({ children, onClick, type = 'button' }) => {
    return (
      <button
        type={type}
        sx={{
          backgroundColor: 'accent',
          color: '#fff',
          borderRadius: '0.5rem',
          border: 'none',
          padding: '0.25rem 0.5rem',
        }}
        onClick={onClick}
      >
        {children}
      </button>
    );
  };
