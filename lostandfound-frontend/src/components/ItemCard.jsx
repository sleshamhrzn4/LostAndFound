import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function ItemCard({
  item,
  onEdit,
  onDelete,
  isAdmin,
  claim,
  onApproveClaim,
  onRejectClaim,
  onSubmitClaim,
}) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showClaimDetailsModal, setShowClaimDetailsModal] = useState(false);
  const [message, setMessage] = useState("");

  const handleClaimClick = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setShowClaimModal(true);
  };

  const submitClaim = async () => {
    try {
      await onSubmitClaim(item._id, message);
      setShowClaimModal(false);
      setMessage("");
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const typeLabel = item.type === "lost" ? "Lost" : "Found";
  const statusLabel = item.type === "lost"
    ? (item.status === "claimed" ? "Found" : "Not found")
    : (item.status === "claimed" ? "Claimed" : "Unclaimed");

  return (
    <div className="item-card" onClick={() => setShowDetailsModal(true)}>
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.title} className="item-image" />
      ) : (
        <div className="item-image" aria-label="No image available" />
      )}

      <h2 className="item-title">{item.title}</h2>
      <div className={`item-type ${item.type === "found" ? "found" : ""}`}>{typeLabel}</div>
      <p className="item-category">{item.category}</p>
      <p className="item-location">{item.location}</p>
      <p className="item-status">{statusLabel}</p>

      {isAdmin ? (
        <>
          {claim ? (
            <button
              type="button"
              className="btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowClaimDetailsModal(true);
              }}
            >
              View claim request
            </button>
          ) : null}

          <div className="card-actions">
            <button
              type="button"
              className="btn"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
            >
              Update status
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item._id);
              }}
            >
              Delete
            </button>
          </div>
        </>
      ) : item.status !== "claimed" ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            handleClaimClick();
          }}
        >
          Claim this item
        </button>
      ) : null}

      {showDetailsModal ? (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{item.title}</h3>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="item-image" />
            ) : null}
            <p>{item.description}</p>
            <p className="item-reportedBy"><strong>Reported by:</strong> {item.reportedBy}</p>
            <p className="item-date">
              <strong>Date:</strong> {new Date(item.dateReported).toLocaleDateString()}
            </p>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showClaimModal ? (
        <div
          className="modal-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setShowClaimModal(false);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Claim “{item.title}”</h3>
            <p className="page-subtitle">
              Tell the administrator why this item belongs to you.
            </p>
            <textarea
              placeholder="Why is this yours?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button type="button" className="btn btn-primary" onClick={submitClaim}>
                Submit claim
              </button>
              <button type="button" className="btn" onClick={() => setShowClaimModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSuccessModal ? (
        <div
          className="modal-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setShowSuccessModal(false);
          }}
        >
          <div className="modal-content modal-success" onClick={(e) => e.stopPropagation()}>
            <p>Claim submitted successfully.</p>
            <button type="button" className="btn btn-primary" onClick={() => setShowSuccessModal(false)}>
              Done
            </button>
          </div>
        </div>
      ) : null}

      {showClaimDetailsModal && claim ? (
        <div
          className="modal-overlay"
          onClick={(e) => {
            e.stopPropagation();
            setShowClaimDetailsModal(false);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Claim request</h3>
            <p><strong>Requested by:</strong> {claim.requester?.email || "Unknown user"}</p>
            {claim.message ? <p className="claim-message">“{claim.message}”</p> : null}

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onApproveClaim(claim._id);
                  setShowClaimDetailsModal(false);
                }}
              >
                Approve
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  onRejectClaim(claim._id);
                  setShowClaimDetailsModal(false);
                }}
              >
                Reject
              </button>
              <button type="button" className="btn" onClick={() => setShowClaimDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ItemCard;