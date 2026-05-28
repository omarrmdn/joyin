export default function Loading() {
  return (
    <div className="flex justify-center items-center h-full w-full p-8" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner-mini" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
      <p style={{ color: 'var(--secondary-text)' }}>Loading...</p>
    </div>
  );
}
