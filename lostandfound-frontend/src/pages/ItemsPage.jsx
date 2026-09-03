import { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";
import ItemCard from "../components/ItemCard";
import ItemForm from "../components/ItemForm";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../api";

const API_URL = `${API_BASE}/items`;
const CLAIMS_URL = `${API_BASE}/claims`;

const EMPTY_FORM = {
    title: "",
    description: "",
    category: "",
    type: "",
    location: "",
    reportedBy: "",
};

function ItemsPage() {
    const [items, setItems] = useState([]);
    const [claims, setClaims] = useState([]);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, isAdmin } = useAuth();
    const [typeFilter, setTypeFilter] = useState("");

    function authHeaders() {
        return { headers: { Authorization: `Bearer ${token}` } };
    }

    async function loadItems() {
        try {
            const params = {};
            if (query) params.search = query;
            if (statusFilter) params.status = statusFilter;
            if (categoryFilter) params.category = categoryFilter;
            if (typeFilter) params.type = typeFilter;

            const res = await axios.get(API_URL, { params });
            setItems(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Could not load items. Is the server running?");
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
    }, [query, statusFilter, categoryFilter, typeFilter]);

    useEffect(() => {
        loadClaims();
    }, [isAdmin, items]);

    async function handleSubmit(values) {
        await axios.post(API_URL, values, authHeaders());
        setShowForm(false);
        loadItems();
    }

    function handleCancel() {
        setShowForm(false);
    }

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

    const lostCount = items.filter((item) => item.type === "lost").length;
    const foundCount = items.filter((item) => item.type === "found").length;
    const resolvedCount = items.filter((item) => item.status === "claimed").length;

    if (loading) {
        return <p className="state-message">Loading reports…</p>;
    }

    if (error) {
        return <p className="state-message form-error">{error}</p>;
    }

    return (
        <div className="main-page">
            <section className="hero">
                <div className="hero-kicker">Campus Lost &amp; Found</div>
                <h1>Find what you lost. Return what you found.</h1>
                <p>
                    A simple, trusted place to browse reports, reconnect belongings
                    with their owners, and help your campus community.
                </p>

                <div className="hero-search">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for an item…"
                        aria-label="Search items"
                    />
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setTypeFilter("")}
                    >
                        Search reports
                    </button>
                </div>

                <div className="hero-actions">
                    <button type="button" className="btn" onClick={() => setTypeFilter("lost")}>
                        Browse lost items
                    </button>
                    <button type="button" className="btn" onClick={() => setTypeFilter("found")}>
                        Browse found items
                    </button>
                    {isAdmin ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setShowForm((value) => !value)}
                        >
                            + Report an item
                        </button>
                    ) : null}
                </div>
            </section>

            <section className="stats-grid" aria-label="Report statistics">
                <div className="stat-card">
                    <div className="stat-label">Reports shown</div>
                    <div className="stat-value">{items.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Lost reports</div>
                    <div className="stat-value">{lostCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Found reports</div>
                    <div className="stat-value">{foundCount}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Resolved</div>
                    <div className="stat-value">{resolvedCount}</div>
                </div>
            </section>

            {showForm ? (
                <ItemForm
                    key="new"
                    initialValues={EMPTY_FORM}
                    isEditing={false}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            ) : null}

            <section>
                <div className="browse-header">
                    <div>
                        <h2 className="page-title">Browse reports</h2>
                        <p className="page-subtitle">
                            Search by name, narrow results by category or status, and open any card for details.
                        </p>
                    </div>
                </div>

                <div className="type-tabs">
                    <button
                        type="button"
                        className={typeFilter === "" ? "tab active" : "tab"}
                        onClick={() => setTypeFilter("")}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        className={typeFilter === "lost" ? "tab active" : "tab"}
                        onClick={() => setTypeFilter("lost")}
                    >
                        Lost
                    </button>
                    <button
                        type="button"
                        className={typeFilter === "found" ? "tab active" : "tab"}
                        onClick={() => setTypeFilter("found")}
                    >
                        Found
                    </button>
                </div>

                <div className="filter-bar">
                    <input
                        className="search-input"
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by item title…"
                        aria-label="Search items"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="Filter by status"
                    >
                        <option value="">All status</option>
                        <option value="unclaimed">Unclaimed</option>
                        <option value="claimed">Claimed</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        aria-label="Filter by category"
                    >
                        <option value="">All categories</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Wallet">Wallet</option>
                        <option value="Bag">Bag</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Clothing">Clothing</option>
                    </select>

                    <button
                        type="button"
                        className="btn"
                        onClick={() => {
                            setQuery("");
                            setStatusFilter("");
                            setCategoryFilter("");
                            setTypeFilter("");
                        }}
                    >
                        Reset
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">⌕</div>
                        <h3>No reports found</h3>
                        <p>Try a different search term or clear your filters.</p>
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
                                claim={claims.find((c) => c.itemId?._id === item._id)}
                                onApproveClaim={handleApproveClaim}
                                onRejectClaim={handleRejectClaim}
                                onSubmitClaim={handleSubmitClaim}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default ItemsPage;
