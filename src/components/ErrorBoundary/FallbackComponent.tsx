import React from 'react';

const FallbackComponent: React.FC = () => {
    const handleReload = () => { window.location.reload(); };
    return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
            <h2>Something went wrong</h2>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>
                We&apos;ve been notified and are looking into it.
            </p>
            <button
                type="button"
                onClick={handleReload}
                style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#4F46E5',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                }}
            >
                Reload Page
            </button>
        </div>
    );
};

export default FallbackComponent;
