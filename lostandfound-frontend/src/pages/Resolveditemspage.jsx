import { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";
import ItemCard from "../components/ItemCard";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../api";

const API_URL = `${API_BASE}/items`;
const CLAIMS_URL = `${API_BASE}/claims`;

function ResolvedItemsPage() {
    const [items, setItems] = useState([]);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, isAdmin } = useAuth();

    function authHeaders() {
        return { headers: { Authorization: `Bearer ${token}` } };
    }

    async function loadItems() {
        try {
            const res = await axios.get(API_URL, { params: { status: "claimed" } });
            setItems(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Could not load resolved items. Is the server running?");
        } finally {
            setLoading(false);
        }
    }

    async function loadClaims() {
        if (!isAdmin) return;
        try {
            const res = await axios.get(CLAIMS_URL, authHeaders());
            setClaims(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        loadItems();
    }, []);

    useEffect(() => {
        loadClaims();
    }, [isAdmin, items]);

    async function handleMarkClaimed(item) {
        await axios.put(
            `${API_URL}/${item._id}`,
            { status: item.status === "unclaimed" ? "claimed" : "unclaimed" },
            authHeaders(),
        );
        loadItems();
    }

    async function handleDelete(id) {
        const item = items.find((i) => i._id === id);

        if (!window.confirm(`Delete "${item.title}"?`)) {
            return;
        }

        await axios.delete(`${API_URL}/${id}`, authHeaders());
        loadItems();
    }

    async function handleApproveClaim(claimId) {
        await axios.put(`${CLAIMS_URL}/${claimId}`, { status: "approved" }, authHeaders());
        loadItems();
        loadClaims();
    }

    async function handleRejectClaim(claimId) {
        await axios.put(`${CLAIMS_URL}/${claimId}`, { status: "rejected" }, authHeaders());
        loadClaims();
    }

    async function handleSubmitClaim(itemId, message) {
        await axios.post(CLAIMS_URL, { itemId, message }, authHeaders());
    }

    if (loading) {
        return <p className="state-message">Loading resolved items…</p>;
    }

    if (error) {
        return <p className="state-message form-error">{error}</p>;
    }

    return (
        <div className="main-page">
            <section className="browse-header">
                <div>
                    <h2 className="page-title">Resolved items</h2>
                    <p className="page-subtitle">
                        Items that have already been claimed and reunited with their owners.
                    </p>
                </div>
            </section>

            {items.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">✓</div>
                    <h3>No resolved items yet</h3>
                    <p>Claimed items will show up here once they're marked resolved.</p>
                </div>
            ) : (
                <div className="professional-cards-container">
                    {items.map((item) => (
                        <ItemCard
                            key={item._id}
                            item={item}
                            onEdit={handleMarkClaimed}
                            onDelete={handleDelete}
                            isAdmin={isAdmin}
                            claim={claims.find((c) => c.item?._id === item._id)}
                            onApproveClaim={handleApproveClaim}
                            onRejectClaim={handleRejectClaim}
                            onSubmitClaim={handleSubmitClaim}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ResolvedItemsPage;