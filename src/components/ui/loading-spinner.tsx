"use client"

export function LoadingSpinner({ className }: { className?: string }) {
    return (
        <div className={`relative w-12 h-12 animate-spin-slow ${className}`}>
            {[...Array(12)].map((_, i) => (
            <div
                key={i}
                className="absolute left-1/2 top-0 w-[3px] h-3 rounded-full bg-current"
                style={{
                transformOrigin: 'center 24px',
                transform: `translateX(-50%) rotate(${i * 30}deg)`,
                opacity: (1 - i / 12) * 0.9 + 0.1,
                }}
            />
            ))}
      </div>
    )
}
