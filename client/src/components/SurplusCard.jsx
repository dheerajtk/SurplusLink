import React from 'react';

/**
 * SurplusCard — one post on the pickup board.
 * Shows status badge, item list, expiry countdown, and action buttons.
 */
export default function SurplusCard({ post, currentUser, onClaim, onConfirm }) {
  const expiresIn = Math.max(0, Math.floor((new Date(post.expiryTime) - Date.now()) / 60000));
  const isExpired = expiresIn === 0 && post.status === 'available';

  return (
    <div className={`card card--${post.status}`}>
      <div className="flex-between">
        <span className={`badge badge-${post.status}`}>{post.status.replace('_', ' ')}</span>
        <span className="text-sm text-muted">
          {post.status === 'available'
            ? (isExpired ? 'Expired' : `Expires in ${expiresIn} min`)
            : post.status === 'picked_up'
              ? `Picked up ${new Date(post.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : `Claimed by ${post.claimedBy?.name || 'partner'}`}
        </span>
      </div>

      <ul className="mt-1" style={{ paddingLeft: 18, marginTop: 10 }}>
        {post.items.map((item, i) => (
          <li key={i}><strong>{item.quantity} {item.unit}</strong> of {item.name}</li>
        ))}
      </ul>

      <p className="text-sm text-muted mt-1">
        Posted by {post.postedBy?.name || 'staff'} ·
        Prepared {new Date(post.preparedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>

      <div className="mt-2 flex gap-2">
        {post.status === 'available' && currentUser?.role === 'partner' && !isExpired && (
          <button className="btn btn-primary btn-sm" onClick={() => onClaim(post._id)}>
            Claim
          </button>
        )}
        {post.status === 'claimed' && String(post.claimedBy?._id || post.claimedBy) === String(currentUser?._id) && (
          <button className="btn btn-secondary btn-sm" onClick={() => onConfirm(post._id)}>
            Confirm Pickup
          </button>
        )}
      </div>
    </div>
  );
}
