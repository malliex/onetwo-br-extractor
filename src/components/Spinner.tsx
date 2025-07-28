export default function Spinner({ size = 6 }: { size?: number }) {
  return (
    <div
      className={`border-4 border-gray-300 border-t-black rounded-full animate-spin`}
      style={{
        width: `${size * 4}px`,
        height: `${size * 4}px`,
        borderWidth: `${size / 2}px`,
      }}
    />
  );
}
