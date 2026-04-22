export function Spinner({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{
        width: size, height: size,
        border: '3px solid #333', borderTopColor: '#7c3aed',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  )
}
