'use client';

export default function AppleLoader() {
  return (
    <div className="flex justify-center py-3">
      <div className="apple-loader-container">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="spinner-blade" />
        ))}
      </div>
    </div>
  );
}
