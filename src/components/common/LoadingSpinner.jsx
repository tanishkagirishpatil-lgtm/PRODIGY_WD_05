export default function LoadingSpinner({ size = 40 }) {
  return (
    <div className="loading-center">
      <div className="loading-spinner" style={{ width: size, height: size }} />
    </div>
  );
}
