export function SearchResultSkeleton() {
  return (
    <div className="search-result-item skeleton">
      <div className="sr-card-link-wrapper" style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
        <div className="search-result-image-wrapper skeleton-img" style={{ flexShrink: 0 }}></div>
        <div className="search-result-content" style={{ flex: 1 }}>
          <div className="sr-title-row">
            <div className="skeleton-text skeleton-title" style={{ width: '70%', height: '20px', marginBottom: '12px' }}></div>
          </div>
          <div className="sr-info-row-flex" style={{ flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            <div className="skeleton-text skeleton-info" style={{ width: '50%', height: '14px', margin: 0 }}></div>
            <div className="skeleton-text skeleton-info" style={{ width: '60%', height: '14px', margin: 0 }}></div>
          </div>
          <div className="sr-footer">
            <div className="skeleton-text skeleton-price" style={{ width: '30%', height: '18px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
