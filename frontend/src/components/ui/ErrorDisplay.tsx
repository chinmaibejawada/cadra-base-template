export default function ErrorDisplay({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-center">
      <p className="text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline">
          Try again
        </button>
      )}
    </div>
  );
}