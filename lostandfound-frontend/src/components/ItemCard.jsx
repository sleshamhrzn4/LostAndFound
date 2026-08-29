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

  return (
    <div className="item-card" onClick={() => setShowDetailsModal(true)}>
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.title} className="item-image" />
      ) : null}
      <h2 className="item-title">{item.title}</h2>
      <h3 className="item-type">{item.type === "lost" ? "Lost" : "Found"}</h3>

      <p className="item-category">{item.category}</p>
      <p className="item-location">{item.location}</p>
      <p className="item-status">
        Status: {item.type === "lost"
          ? (item.status === "claimed" ? "Found" : "Not found")
          : (item.status === "claimed" ? "Claimed" : "Unclaimed")}
      </p>

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
          className="btn"
          onClick={(e) => {
            e.stopPropagation();
            handleClaimClick();
          }}
        >
          Claim this item
        </button>
      ) : null}

      {showDetailsModal ? (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{item.title}</h3>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="item-image" />
            ) : null}
            <p className="item-description">{item.description}</p>
            <p className="item-reportedBy">Reported by: {item.reportedBy}</p>
            <p className="item-date">
              Date: {new Date(item.dateReported).toLocaleDateString()}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="link-button"
                onClick={() => setShowDetailsModal(false)}
              >
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
            <h3>Claim "{item.title}"</h3>
            <textarea
              placeholder="Why is this yours?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button type="button" className="btn" onClick={submitClaim}>
                Submit Claim
              </button>
              <button
                type="button"
                className="link-button"
                onClick={() => setShowClaimModal(false)}
              >
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
          <div
            className="modal-content modal-success"
            onClick={(e) => e.stopPropagation()}
          >
            <p>Claim submitted successfully!</p>
            <button
              type="button"
              className="btn"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
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
            <p>
              <strong>Requested by:</strong> {claim.claimedBy?.username}
            </p>
            {claim.claimedBy?.email ? (
              <p>
                <strong>Email:</strong> {claim.claimedBy.email}
              </p>
            ) : null}
            {claim.message ? (
              <p className="claim-message">"{claim.message}"</p>
            ) : null}
            <div className="modal-actions">
              <button
                type="button"
                className="btn"
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
              <button
                type="button"
                className="link-button"
                onClick={() => setShowClaimDetailsModal(false)}
              >
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