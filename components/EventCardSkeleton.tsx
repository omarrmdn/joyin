export function EventCardSkeleton() {
  return (
    <div className="event-card skeleton">
      <div className="event-card-image-container skeleton-img"></div>
      <div className="event-card-content">
        <div className="skeleton-text skeleton-title"></div>
        <div className="event-card-info-row">
          <div className="skeleton-text skeleton-info"></div>
          <div className="skeleton-text skeleton-info"></div>
        </div>
        <div className="event-card-footer" style={{ marginTop: '8px' }}>
          <div className="skeleton-text skeleton-price"></div>
          <div className="event-card-avatars-container">
            <div className="event-card-avatars">
              <div className="skeleton-avatar" style={{ zIndex: 3 }}></div>
              <div className="skeleton-avatar" style={{ zIndex: 2 }}></div>
              <div className="skeleton-avatar" style={{ zIndex: 1 }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
