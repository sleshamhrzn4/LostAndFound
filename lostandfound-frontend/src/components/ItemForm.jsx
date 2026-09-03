import { useState } from "react";

function validate(form) {
  const errors = {};

  if (form.title.trim() === "") {
    errors.title = "Title is required";
  } else if (form.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  }

  if (form.description.trim().length < 10) {
    errors.description = "Please write at least 10 characters";
  }

  if (form.category.trim() === "") errors.category = "Category is required";
  if (form.type !== "lost" && form.type !== "found") errors.type = "Select lost or found";
  if (form.location.trim() === "") errors.location = "Location is required";
  if (form.reportedBy.trim() === "") errors.reportedBy = "Reporter contact is required";

  return errors;
}

function ItemForm({ initialValues, isEditing, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleImageChange(e) {
    setImageFile(e.target.files[0] || null);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("type", form.type);
    formData.append("location", form.location);
    formData.append("reportedBy", form.reportedBy);

    if (imageFile) formData.append("image", imageFile);

    onSubmit(formData);

    setForm(initialValues);
    setImageFile(null);
    setErrors({});
  }

  return (
    <form className="item-form" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">
        {isEditing ? "Update item status" : "Report an item"}
      </h2>

      <div className="form-row">
        <label className="form-label" htmlFor="title">Item title</label>
        <input id="title" name="title" className="form-input" value={form.title} onChange={handleChange} placeholder="e.g. Black backpack" />
        {errors.title ? <span className="form-error">{errors.title}</span> : null}
      </div>

      <div className="form-row">
        <label className="form-label" htmlFor="type">Report type</label>
        <select id="type" name="type" className="form-input" value={form.type} onChange={handleChange}>
          <option value="">Select report type</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        {errors.type ? <span className="form-error">{errors.type}</span> : null}
      </div>

      <div className="form-row">
        <label className="form-label" htmlFor="category">Category</label>
        <input id="category" name="category" className="form-input" value={form.category} onChange={handleChange} placeholder="Electronics, Wallet, Bag…" />
        {errors.category ? <span className="form-error">{errors.category}</span> : null}
      </div>

      <div className="form-row">
        <label className="form-label" htmlFor="location">Location</label>
        <input id="location" name="location" className="form-input" value={form.location} onChange={handleChange} placeholder="Where was it lost or found?" />
        {errors.location ? <span className="form-error">{errors.location}</span> : null}
      </div>

      <div className="form-row">
        <label className="form-label" htmlFor="reportedBy">Reporter contact</label>
        <input id="reportedBy" name="reportedBy" className="form-input" value={form.reportedBy} onChange={handleChange} placeholder="Email or contact information" />
        {errors.reportedBy ? <span className="form-error">{errors.reportedBy}</span> : null}
      </div>

      <div className="form-row">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea id="description" name="description" className="form-input form-textarea" rows={4} value={form.description} onChange={handleChange} placeholder="Add details that can help identify the item…" />
        {errors.description ? <span className="form-error">{errors.description}</span> : null}
      </div>

      <div className="form-row">
        <label className="form-label" htmlFor="image">Photo</label>
        <input id="image" name="image" type="file" accept="image/*" className="form-input" onChange={handleImageChange} />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {isEditing ? "Save changes" : "Publish report"}
        </button>
        {isEditing ? (
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        ) : null}
      </div>
    </form>
  );
}

export default ItemForm;
