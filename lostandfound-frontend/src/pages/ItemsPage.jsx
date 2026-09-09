import { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";
import ItemCard from "../components/ItemCard";
import ItemForm from "../components/ItemForm";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../api";
import { useSearchParams, useNavigate } from "react-router";
import { useToast } from "../components/Toast";
import useTypewriter from "../hooks/useTypewriter";


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
    const [categoryFilter, setCategoryFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, isAdmin, isLoggedIn } = useAuth();
    const [typeFilter, setTypeFilter] = useState("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const showToast = useToast();
    const heroText = useTypewriter("Find what you lost. Return what you found.");

    useEffect(() => {
        const urlSearch = searchParams.get("search");
        if (urlSearch) {
            setQuery(urlSearch);
        }
    }, [searchParams]);

    function authHeaders() {
        return { headers: { Authorization: `Bearer ${token}` } };
    }

    async function loadItems() {
        try {
            const params = {};
            if (query) params.search = query;
            params.status = "unclaimed";
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
    }, [query, categoryFilter, typeFilter]);

    useEffect(() => {
        loadClaims();
    }, [isAdmin, items]);

    async function handleSubmit(values) {
        try {
            await axios.post(API_URL, values, authHeaders());
            setShowForm(false);
            loadItems();
            showToast("Item reported!", "success");
        } catch (err) {
            console.error(err);
            showToast("Could not report item. Try again.", "error");
        }
    }

    function handleReportClick() {
        if (!isLoggedIn) {
            navigate("/login");
            return;
        }
        setShowForm((value) => !value);
    }

    function handleCancel() {
        setShowForm(false);
    }

    async function handleMarkClaimed(item) {
        try {
            await axios.put(
                `${API_URL}/${item._id}`,
                { status: item.status === "unclaimed" ? "claimed" : "unclaimed" },
                authHeaders(),
            );
            loadItems();
            showToast(item.status === "unclaimed" ? "Marked as claimed" : "Marked as unclaimed", "success");
        } catch (err) {
            console.error(err);
            showToast("Could not update item status.", "error");
        }
    }

    async function handleDelete(id) {
        const item = items.find((i) => i._id === id);

        if (!window.confirm(`Delete "${item.title}"?`)) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/${id}`, authHeaders());
            loadItems();
            showToast("Item deleted", "success");
        } catch (err) {
            console.error(err);
            showToast("Could not delete item.", "error");
        }
    }

    async function handleApproveClaim(claimId) {
        try {
            await axios.put(`${CLAIMS_URL}/${claimId}`, { status: "approved" }, authHeaders());
            loadItems();
            loadClaims();
            showToast("Claim approved", "success");
        } catch (err) {
            console.error(err);
            showToast("Could not approve claim.", "error");
        }
    }

    async function handleRejectClaim(claimId) {
        try {
            await axios.put(`${CLAIMS_URL}/${claimId}`, { status: "rejected" }, authHeaders());
            loadClaims();
            showToast("Claim rejected", "success");
        } catch (err) {
            console.error(err);
            showToast("Could not reject claim.", "error");
        }
    }

    async function handleSubmitClaim(itemId, message) {
        try {
            await axios.post(CLAIMS_URL, { itemId, message }, authHeaders());
            showToast("Claim submitted", "success");
        } catch (err) {
            console.error(err);
            showToast("Could not submit claim.", "error");
        }
    }

    if (loading) {
        return <p className="state-message">Loading reports…</p>;
    }

    if (error) {
        return <p className="state-message form-error">{error}</p>;
    }

    return (
        <div className="main-page">
            {!isAdmin && (
                <section className="hero">
                    <div className="hero-content">
                        <div className="hero-kicker">
                            <span className="live-dot" /> College Lost &amp; Found
                        </div>
                        <h1>
                            {heroText}
                            <span className="typewriter-cursor">|</span>
                        </h1>
                        <p>
                            A simple, trusted place to browse reports, reconnect belongings
                            with their owners, and help your campus community.
                        </p>
                    </div>
                </section>
            )}
            {showForm ? (
                <div className="modal-overlay" onClick={handleCancel}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <ItemForm
                            key="new"
                            initialValues={isAdmin ? EMPTY_FORM : { ...EMPTY_FORM, type: "lost" }}
                            isEditing={false}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isAdmin={isAdmin}
                        />
                    </div>
                </div>
            ) : null}

            <section>
                <div className="filter-bar">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        aria-label="Filter by category"
                    >
                        <option value="">All categories</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Wallet">Wallet</option>
                        <option value="Bag">Bag</option>
                        <option value="Documents">Books</option>
                        <option value="Keys">Keys</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Clothing">Clothing</option>
                    </select>

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

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleReportClick}
                    >
                        {isAdmin ? "+ Report an item" : "+ Report lost item"}
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
                                claims={claims.filter((c) => c.item?._id === item._id)}
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