interface Props { page: number; totalPages: number; onPageChange: (p: number) => void; }
export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button onClick={() => onPageChange(1)} disabled={page === 1}>«</button>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</button>
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let p = i + 1;
        if (totalPages > 5) {
          if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;
        }
        return (
          <button key={p} onClick={() => onPageChange(p)} className={page === p ? 'active' : ''}>{p}</button>
        );
      })}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>›</button>
      <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>»</button>
    </div>
  );
}
