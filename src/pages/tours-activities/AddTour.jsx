import React, { useState } from "react";

const API_BASE =
  process.env.REACT_APP_API_URL || "https://bmtvendorfinal.onrender.com";

export default function AddTour({ onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    category: "",
    city: "",
    state: "",
    country: "India",
    address: "",
    latitude: "",
    longitude: "",
    durationValue: "",
    durationUnit: "days",
    adultPrice: "",
    childPrice: "",
    infantPrice: "",
    maxGuests: "",
    meetingPoint: "",
    cancellationPolicy: "",
    termsAndConditions: "",
    images: "",
    inclusions: "",
    exclusions: "",
    itinerary: ""
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const linesToArray = (value) => {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const parseItinerary = (value) => {
    return value
      .split("\n")
      .map((line, index) => {
        const parts = line.split("|").map((part) => part.trim());

        if (parts.length >= 3) {
          return {
            day: Number(parts[0]) || index + 1,
            title: parts[1],
            description: parts.slice(2).join(" | ")
          };
        }

        if (parts.length === 2) {
          return {
            day: Number(parts[0]) || index + 1,
            title: parts[1],
            description: ""
          };
        }

        if (parts[0]) {
          return {
            day: index + 1,
            title: parts[0],
            description: ""
          };
        }

        return null;
      })
      .filter((item) => item && item.title);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Tour title is required");
      return;
    }

    if (!form.description.trim()) {
      setError("Description is required");
      return;
    }

    if (!form.category.trim()) {
      setError("Category is required");
      return;
    }

    if (!form.city.trim()) {
      setError("City is required");
      return;
    }

    if (!form.durationValue) {
      setError("Duration is required");
      return;
    }

    if (form.adultPrice === "") {
      setError("Adult price is required");
      return;
    }

    if (!form.maxGuests) {
      setError("Maximum guests is required");
      return;
    }

    const token = localStorage.getItem("vendorToken");

    if (!token) {
      setError("Vendor authentication token not found. Please login again.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      category: form.category.trim(),

      location: {
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim() || "India",
        address: form.address.trim(),
        ...(form.latitude !== ""
          ? { latitude: Number(form.latitude) }
          : {}),
        ...(form.longitude !== ""
          ? { longitude: Number(form.longitude) }
          : {})
      },

      duration: {
        value: Number(form.durationValue),
        unit: form.durationUnit
      },

      images: linesToArray(form.images),
      inclusions: linesToArray(form.inclusions),
      exclusions: linesToArray(form.exclusions),
      itinerary: parseItinerary(form.itinerary),

      pricing: {
        adult: Number(form.adultPrice),
        child: Number(form.childPrice || 0),
        infant: Number(form.infantPrice || 0)
      },

      maxGuests: Number(form.maxGuests),
      meetingPoint: form.meetingPoint.trim(),
      cancellationPolicy: form.cancellationPolicy.trim(),
      termsAndConditions: form.termsAndConditions.trim()
    };

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE}/api/vendor/tours`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to create tour"
        );
      }

      if (onSaved) {
        onSaved(data.tour);
      }

      onClose();
    } catch (err) {
      console.error("CREATE TOUR ERROR:", err);
      setError(
        err.message || "Failed to create tour"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-tour-overlay">
      <div className="add-tour-modal">
        <div className="add-tour-header">
          <div>
            <span>TOURS & ACTIVITIES</span>
            <h2>Add New Tour</h2>
            <p>
              Create a new tour package for your vendor account.
            </p>
          </div>

          <button
            type="button"
            className="add-tour-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="add-tour-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="add-tour-section">
            <h3>Basic Information</h3>

            <div className="add-tour-grid">
              <div className="add-tour-field full">
                <label>Tour Title *</label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    update("title", e.target.value)
                  }
                  placeholder="e.g. Faridabad Heritage City Tour"
                />
              </div>

              <div className="add-tour-field">
                <label>Category *</label>
                <input
                  value={form.category}
                  onChange={(e) =>
                    update("category", e.target.value)
                  }
                  placeholder="e.g. City Tour"
                />
              </div>

              <div className="add-tour-field">
                <label>Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) =>
                    update("slug", e.target.value)
                  }
                  placeholder="faridabad-heritage-city-tour"
                />
              </div>

              <div className="add-tour-field full">
                <label>Short Description</label>
                <input
                  value={form.shortDescription}
                  onChange={(e) =>
                    update(
                      "shortDescription",
                      e.target.value
                    )
                  }
                  placeholder="Short description of the tour"
                />
              </div>

              <div className="add-tour-field full">
                <label>Description *</label>
                <textarea
                  rows="5"
                  value={form.description}
                  onChange={(e) =>
                    update(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Describe the tour in detail"
                />
              </div>
            </div>
          </div>

          <div className="add-tour-section">
            <h3>Location</h3>

            <div className="add-tour-grid">
              <div className="add-tour-field">
                <label>City *</label>
                <input
                  value={form.city}
                  onChange={(e) =>
                    update("city", e.target.value)
                  }
                  placeholder="Faridabad"
                />
              </div>

              <div className="add-tour-field">
                <label>State</label>
                <input
                  value={form.state}
                  onChange={(e) =>
                    update("state", e.target.value)
                  }
                  placeholder="Haryana"
                />
              </div>

              <div className="add-tour-field">
                <label>Country</label>
                <input
                  value={form.country}
                  onChange={(e) =>
                    update("country", e.target.value)
                  }
                  placeholder="India"
                />
              </div>

              <div className="add-tour-field">
                <label>Address</label>
                <input
                  value={form.address}
                  onChange={(e) =>
                    update("address", e.target.value)
                  }
                  placeholder="Full address"
                />
              </div>

              <div className="add-tour-field">
                <label>Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) =>
                    update("latitude", e.target.value)
                  }
                  placeholder="28.4089"
                />
              </div>

              <div className="add-tour-field">
                <label>Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) =>
                    update("longitude", e.target.value)
                  }
                  placeholder="77.3178"
                />
              </div>

              <div className="add-tour-field full">
                <label>Meeting Point</label>
                <input
                  value={form.meetingPoint}
                  onChange={(e) =>
                    update(
                      "meetingPoint",
                      e.target.value
                    )
                  }
                  placeholder="Hotel / landmark / pickup point"
                />
              </div>
            </div>
          </div>

          <div className="add-tour-section">
            <h3>Duration & Capacity</h3>

            <div className="add-tour-grid">
              <div className="add-tour-field">
                <label>Duration *</label>
                <input
                  type="number"
                  min="1"
                  value={form.durationValue}
                  onChange={(e) =>
                    update(
                      "durationValue",
                      e.target.value
                    )
                  }
                  placeholder="1"
                />
              </div>

              <div className="add-tour-field">
                <label>Unit *</label>
                <select
                  value={form.durationUnit}
                  onChange={(e) =>
                    update(
                      "durationUnit",
                      e.target.value
                    )
                  }
                >
                  <option value="days">Days</option>
                  <option value="hours">Hours</option>
                </select>
              </div>

              <div className="add-tour-field">
                <label>Maximum Guests *</label>
                <input
                  type="number"
                  min="1"
                  value={form.maxGuests}
                  onChange={(e) =>
                    update(
                      "maxGuests",
                      e.target.value
                    )
                  }
                  placeholder="20"
                />
              </div>
            </div>
          </div>

          <div className="add-tour-section">
            <h3>Pricing</h3>

            <div className="add-tour-grid">
              <div className="add-tour-field">
                <label>Adult Price *</label>
                <input
                  type="number"
                  min="0"
                  value={form.adultPrice}
                  onChange={(e) =>
                    update(
                      "adultPrice",
                      e.target.value
                    )
                  }
                  placeholder="1499"
                />
              </div>

              <div className="add-tour-field">
                <label>Child Price</label>
                <input
                  type="number"
                  min="0"
                  value={form.childPrice}
                  onChange={(e) =>
                    update(
                      "childPrice",
                      e.target.value
                    )
                  }
                  placeholder="999"
                />
              </div>

              <div className="add-tour-field">
                <label>Infant Price</label>
                <input
                  type="number"
                  min="0"
                  value={form.infantPrice}
                  onChange={(e) =>
                    update(
                      "infantPrice",
                      e.target.value
                    )
                  }
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="add-tour-section">
            <h3>Tour Content</h3>

            <div className="add-tour-grid">
              <div className="add-tour-field">
                <label>Image URLs</label>
                <textarea
                  rows="5"
                  value={form.images}
                  onChange={(e) =>
                    update("images", e.target.value)
                  }
                  placeholder={`One URL per line`}
                />
              </div>

              <div className="add-tour-field">
                <label>Inclusions</label>
                <textarea
                  rows="5"
                  value={form.inclusions}
                  onChange={(e) =>
                    update(
                      "inclusions",
                      e.target.value
                    )
                  }
                  placeholder={`Breakfast
Hotel pickup
Tour guide`}
                />
              </div>

              <div className="add-tour-field">
                <label>Exclusions</label>
                <textarea
                  rows="5"
                  value={form.exclusions}
                  onChange={(e) =>
                    update(
                      "exclusions",
                      e.target.value
                    )
                  }
                  placeholder={`Personal expenses
Travel insurance`}
                />
              </div>

              <div className="add-tour-field">
                <label>Itinerary</label>
                <textarea
                  rows="5"
                  value={form.itinerary}
                  onChange={(e) =>
                    update(
                      "itinerary",
                      e.target.value
                    )
                  }
                  placeholder={`1 | Arrival | Arrive at the destination
2 | Sightseeing | Visit major attractions
3 | Departure | Return journey`}
                />
              </div>
            </div>
          </div>

          <div className="add-tour-section">
            <h3>Policies</h3>

            <div className="add-tour-field">
              <label>Cancellation Policy</label>
              <textarea
                rows="4"
                value={form.cancellationPolicy}
                onChange={(e) =>
                  update(
                    "cancellationPolicy",
                    e.target.value
                  )
                }
                placeholder="Describe cancellation rules"
              />
            </div>

            <div className="add-tour-field">
              <label>Terms & Conditions</label>
              <textarea
                rows="4"
                value={form.termsAndConditions}
                onChange={(e) =>
                  update(
                    "termsAndConditions",
                    e.target.value
                  )
                }
                placeholder="Enter terms and conditions"
              />
            </div>
          </div>

          <div className="add-tour-actions">
            <button
              type="button"
              className="add-tour-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-tour-submit"
              disabled={saving}
            >
              {saving ? "Creating Tour..." : "Create Tour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}