'use client';

export function BackgroundVideo() {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
