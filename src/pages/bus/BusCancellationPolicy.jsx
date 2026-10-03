import React, { useState, useEffect, useMemo } from "react";
import {
  MdPolicy,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdCheckCircle,
  MdRefresh,
  MdSave,
  MdCurrencyRupee,
  MdCalculate,
  MdWarning,
  MdContentCopy,
  MdToggleOn,
  MdToggleOff,
  MdAssignmentTurnedIn,
} from "react-icons/md";
import "./BusCancellationPolicy.css";

/* ===================================================
   DEFAULT REDBUS BO GDS CANCELLATION SLABS
   =================================================== */
const DEFAULT_SLABS = [
  {
    id: "slab-1",
    timeFrame: "Before 24 hours of departure",
    minHours: 24,
    maxHours: 9999,
    deductionPct: 10,
    refundPct: 90,
    minFee: 50,
    description: "Standard early cancellation. Minimal operator handling fee.",
    active: true,
  },
  {
    id: "slab-2",
    timeFrame: "Between 12 to 24 hours before departure",
    minHours: 12,
    maxHours: 24,
    deductionPct: 25,
    refundPct: 75,
    minFee: 100,
    description: "Moderate cancellation charge before final manifest prep.",
    active: true,
  },
  {
    id: "slab-3",
    timeFrame: "Between 6 to 12 hours before departure",
    minHours: 6,
    maxHours: 12,
    deductionPct: 50,
    refundPct: 50,
    minFee: 150,
    description: "Half fare deduction for short-notice cancellations.",
    active: true,
  },
  {
    id: "slab-4",
    timeFrame: "Between 2 to 6 hours before departure",
    minHours: 2,
    maxHours: 6,
    deductionPct: 80,
    refundPct: 20,
    minFee: 200,
    description: "High deduction as seat re-allotment becomes unlikely.",
    active: true,
  },
  {
    id: "slab-5",
    timeFrame: "Within 2 hours of departure or post-departure (No-Show)",
    minHours: 0,
    maxHours: 2,
    deductionPct: 100,
    refundPct: 0,
    minFee: 0,
    description: "No refund once boarding chart has been prepared or bus dispatched.",
    active: true,
  },
];

/* ===================================================
   DEFAULT OPERATIONAL RULES & TERMS
   =================================================== */
const DEFAULT_RULES = {
  allowPartialCancellation: true,
  allowReschedule: true,
  rescheduleHoursBefore: 6,
  rescheduleFeePct: 0,
  breakdownRefundGuarantee: 100,
  nonRefundableGatewayFee: true,
  specialNotes:
    "1. Partial cancellation is permitted for individual passenger seats on multi-seat bookings.\n2. Cancellation charges are calculated based on the primary origin departure time, not intermediate boarding points.\n3. In case of bus breakdown or service cancellation by operator, 100% full ticket refund will be disbursed within 24-48 business hours.\n4. Platform booking convenience fee and bank charges are non-refundable.\n5. During festive high-demand dates, special non-refundable terms may apply as declared during ticketing.",
};

const STORAGE_KEY = "bmt_bus_cancellation_policy";

export default function BusCancellationPolicy() {
  const [slabs, setSlabs] = useState(DEFAULT_SLABS);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [toast, setToast] = useState({ text: "", type: "" });

  // Slabs Modal
  const [showModal, setShowModal] = useState(false);
  const [editingSlab, setEditingSlab] = useState(null);
  const [slabForm, setSlabForm] = useState({
    timeFrame: "",
    minHours: 0,
    maxHours: 24,
    deductionPct: 25,
    minFee: 50,
    description: "",
    active: true,
  });

  // Simulator State
  const [simPrice, setSimPrice] = useState(1000);
  const [simHours, setSimHours] = useState(18);

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 4000);
  };

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.slabs) setSlabs(parsed.slabs);
        if (parsed.rules) setRules(parsed.rules);
      }
    } catch {
      // Fallback
    }
  }, []);

  // Save to local storage
  const handleSaveAll = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ slabs, rules, updatedAt: new Date().toISOString() })
      );
      showToast("Cancellation policy & rules saved successfully!");
    } catch {
      showToast("Failed to save rules to local storage", "error");
    }
  };

  // Reset to RedBus defaults
  const handleResetDefaults = () => {
    if (
      window.confirm(
        "Reset all cancellation slabs and terms to standard RedBus BO GDS defaults?"
      )
    ) {
      setSlabs(DEFAULT_SLABS);
      setRules(DEFAULT_RULES);
      localStorage.removeItem(STORAGE_KEY);
      showToast("Reset to standard RedBus BO GDS policy slabs");
    }
  };

  // Toggle slab active
  const handleToggleSlab = (id) => {
    setSlabs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  // Delete slab
  const handleDeleteSlab = (id) => {
    if (window.confirm("Remove this cancellation slab?")) {
      setSlabs((prev) => prev.filter((s) => s.id !== id));
      showToast("Slab removed");
    }
  };

  // Open modal
  const handleOpenModal = (slab = null) => {
    if (slab) {
      setEditingSlab(slab);
      setSlabForm({
        timeFrame: slab.timeFrame,
        minHours: slab.minHours,
        maxHours: slab.maxHours,
        deductionPct: slab.deductionPct,
        minFee: slab.minFee,
        description: slab.description,
        active: slab.active,
      });
    } else {
      setEditingSlab(null);
      setSlabForm({
        timeFrame: "",
        minHours: 0,
        maxHours: 12,
        deductionPct: 30,
        minFee: 50,
        description: "",
        active: true,
      });
    }
    setShowModal(true);
  };

  // Save slab form
  const handleSaveSlabForm = (e) => {
    e.preventDefault();
    if (!slabForm.timeFrame.trim()) {
      showToast("Please enter a time frame label", "error");
      return;
    }

    const deduction = Math.min(100, Math.max(0, Number(slabForm.deductionPct)));
    const refund = 100 - deduction;

    if (editingSlab) {
      setSlabs((prev) =>
        prev.map((s) =>
          s.id === editingSlab.id
            ? {
                ...s,
                timeFrame: slabForm.timeFrame,
                minHours: Number(slabForm.minHours),
                maxHours: Number(slabForm.maxHours),
                deductionPct: deduction,
                refundPct: refund,
                minFee: Number(slabForm.minFee),
                description: slabForm.description,
                active: slabForm.active,
              }
            : s
        )
      );
      showToast("Slab updated");
    } else {
      const newSlab = {
        id: `slab-${Date.now()}`,
        timeFrame: slabForm.timeFrame,
        minHours: Number(slabForm.minHours),
        maxHours: Number(slabForm.maxHours),
        deductionPct: deduction,
        refundPct: refund,
        minFee: Number(slabForm.minFee),
        description: slabForm.description,
        active: slabForm.active,
      };
      setSlabs((prev) => [...prev, newSlab]);
      showToast("New cancellation slab added");
    }

    setShowModal(false);
  };

  // Copy policy terms to clipboard
  const handleCopyTerms = () => {
    let text = "CANCELLATION POLICY & REFUND RULES\n\n";
    slabs
      .filter((s) => s.active)
      .forEach((s) => {
        text += `• ${s.timeFrame}: ${s.deductionPct}% Cancellation Fee (${s.refundPct}% Refund)\n`;
      });
    text += `\nSPECIAL OPERATOR RULES:\n${rules.specialNotes}`;
    navigator.clipboard.writeText(text);
    showToast("Policy rules copied to clipboard!");
  };

  // Simulator calculation
  const simResult = useMemo(() => {
    const price = Number(simPrice) || 0;
    const hours = Number(simHours) || 0;

    // Find matching slab
    const matchedSlab = slabs
      .filter((s) => s.active)
      .find((s) => hours >= s.minHours && hours < s.maxHours) ||
      slabs.find((s) => s.deductionPct === 100) ||
      slabs[slabs.length - 1];

    if (!matchedSlab) {
      return { deductionAmt: 0, refundAmt: price, pct: 0, slabName: "None" };
    }

    const calculatedDeduction = (price * matchedSlab.deductionPct) / 100;
    const actualDeduction = Math.min(
      price,
      Math.max(calculatedDeduction, matchedSlab.minFee || 0)
    );
    const refundAmt = Math.max(0, price - actualDeduction);

    return {
      deductionAmt: actualDeduction,
      refundAmt,
      pct: matchedSlab.deductionPct,
      refundPct: matchedSlab.refundPct,
      slabName: matchedSlab.timeFrame,
    };
  }, [simPrice, simHours, slabs]);

  return (
    <div className="bcp-container">
      {/* Toast Alert */}
      {toast.text && (
        <div className={`bcp-toast ${toast.type}`}>
          {toast.type === "error" ? <MdWarning /> : <MdCheckCircle />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="bcp-header">
        <div className="bcp-title-row">
          <div className="bcp-icon-box">
            <MdPolicy />
          </div>
          <div>
            <h1 className="bcp-title">Cancellation Policy & Refund Slabs</h1>
            <p className="bcp-subtitle">
              Configure tiered deduction percentages, passenger refund rules &
              terms of carriage
            </p>
          </div>
        </div>

        <div className="bcp-header-actions">
          <button
            className="bcp-btn bcp-btn-secondary"
            onClick={handleResetDefaults}
            title="Reset to default RedBus rules"
          >
            <MdRefresh /> Reset Defaults
          </button>
          <button
            className="bcp-btn bcp-btn-secondary"
            onClick={handleCopyTerms}
            title="Copy formatted rules for tickets"
          >
            <MdContentCopy /> Copy Rules
          </button>
          <button className="bcp-btn bcp-btn-primary" onClick={handleSaveAll}>
            <MdSave /> Save All Rules
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="bcp-stats-grid">
        <div className="bcp-stat-card">
          <span className="bcp-stat-label">ACTIVE TIME SLABS</span>
          <b className="bcp-stat-val">
            {slabs.filter((s) => s.active).length} of {slabs.length}
          </b>
          <small>Tiered time thresholds</small>
        </div>
        <div className="bcp-stat-card">
          <span className="bcp-stat-label">EARLY REFUND RATE</span>
          <b className="bcp-stat-val text-success">
            {slabs[0]?.refundPct || 90}%
          </b>
          <small>&gt; 24 hrs before departure</small>
        </div>
        <div className="bcp-stat-card">
          <span className="bcp-stat-label">PARTIAL CANCELLATION</span>
          <b className="bcp-stat-val">
            {rules.allowPartialCancellation ? "Allowed" : "Restricted"}
          </b>
          <small>Individual seat releases</small>
        </div>
        <div className="bcp-stat-card">
          <span className="bcp-stat-label">SERVICE BREAKDOWN</span>
          <b className="bcp-stat-val text-primary">100% Refund</b>
          <small>Full operator guarantee</small>
        </div>
      </div>

      {/* Main Grid: Left = Slabs & Rules, Right = Interactive Simulator */}
      <div className="bcp-main-grid">
        {/* Left: Cancellation Slabs Table */}
        <div className="bcp-section-card">
          <div className="bcp-section-header">
            <div>
              <h3>Tiered Cancellation Slabs</h3>
              <p>Refund deductions applied relative to departure time</p>
            </div>
            <button
              className="bcp-btn bcp-btn-sm bcp-btn-primary"
              onClick={() => handleOpenModal()}
            >
              <MdAdd /> Add Custom Slab
            </button>
          </div>

          <div className="bcp-table-wrap">
            <table className="bcp-table">
              <thead>
                <tr>
                  <th>TIME WINDOW BEFORE DEPARTURE</th>
                  <th>CANCELLATION FEE</th>
                  <th>REFUND TO PASSENGER</th>
                  <th>MIN. FEE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {slabs.map((slab) => (
                  <tr
                    key={slab.id}
                    className={!slab.active ? "row-disabled" : ""}
                  >
                    <td>
                      <b>{slab.timeFrame}</b>
                      {slab.description && (
                        <div className="bcp-table-desc">
                          {slab.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="bcp-badge-deduction">
                        {slab.deductionPct}%
                      </span>
                    </td>
                    <td>
                      <span className="bcp-badge-refund">
                        {slab.refundPct}%
                      </span>
                    </td>
                    <td>₹{slab.minFee}</td>
                    <td>
                      <button
                        className="bcp-toggle-btn"
                        onClick={() => handleToggleSlab(slab.id)}
                        title={
                          slab.active ? "Deactivate slab" : "Activate slab"
                        }
                      >
                        {slab.active ? (
                          <MdToggleOn className="toggle-on" />
                        ) : (
                          <MdToggleOff className="toggle-off" />
                        )}
                        <span>{slab.active ? "Active" : "Disabled"}</span>
                      </button>
                    </td>
                    <td>
                      <div className="bcp-actions-cell">
                        <button
                          className="bcp-icon-action"
                          onClick={() => handleOpenModal(slab)}
                          title="Edit slab"
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="bcp-icon-action text-danger"
                          onClick={() => handleDeleteSlab(slab.id)}
                          title="Delete slab"
                        >
                          <MdDeleteOutline />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Operational Policy Toggles */}
          <div className="bcp-rules-subcard">
            <h4>Operational Policy Parameters</h4>
            <div className="bcp-toggles-grid">
              <label className="bcp-checkbox-label">
                <input
                  type="checkbox"
                  checked={rules.allowPartialCancellation}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      allowPartialCancellation: e.target.checked,
                    })
                  }
                />
                <div>
                  <b>Allow Partial Cancellation</b>
                  <small>
                    Permit cancelling selected seats on a multi-passenger
                    ticket
                  </small>
                </div>
              </label>

              <label className="bcp-checkbox-label">
                <input
                  type="checkbox"
                  checked={rules.allowReschedule}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      allowReschedule: e.target.checked,
                    })
                  }
                />
                <div>
                  <b>Allow PrePone / Postpone (Ticket Rescheduling)</b>
                  <small>
                    Passengers can shift travel date before departure
                  </small>
                </div>
              </label>

              <label className="bcp-checkbox-label">
                <input
                  type="checkbox"
                  checked={rules.nonRefundableGatewayFee}
                  onChange={(e) =>
                    setRules({
                      ...rules,
                      nonRefundableGatewayFee: e.target.checked,
                    })
                  }
                />
                <div>
                  <b>Non-Refundable Convenience Fees</b>
                  <small>
                    PG & platform service charges remain non-refundable
                  </small>
                </div>
              </label>
            </div>

            {/* Special Operator Notes */}
            <div className="bcp-notes-box">
              <label>
                <b>Special Operator Terms & Passenger Disclaimers:</b>
              </label>
              <textarea
                rows="4"
                className="bcp-textarea"
                value={rules.specialNotes}
                onChange={(e) =>
                  setRules({ ...rules, specialNotes: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Policy Simulator */}
        <div className="bcp-sidebar-column">
          <div className="bcp-sim-card">
            <div className="bcp-sim-header">
              <MdCalculate className="bcp-sim-icon" />
              <div>
                <h3>Cancellation Simulator</h3>
                <small>Test deduction for any ticket fare in real-time</small>
              </div>
            </div>

            <div className="bcp-sim-inputs">
              <div className="bcp-form-group">
                <label>Ticket Fare (₹)</label>
                <div className="bcp-input-rupee">
                  <MdCurrencyRupee />
                  <input
                    type="number"
                    value={simPrice}
                    onChange={(e) => setSimPrice(e.target.value)}
                    className="bcp-input"
                    min="0"
                  />
                </div>
              </div>

              <div className="bcp-form-group">
                <label>Hours Before Departure: {simHours} hrs</label>
                <input
                  type="range"
                  min="0"
                  max="48"
                  value={simHours}
                  onChange={(e) => setSimHours(Number(e.target.value))}
                  className="bcp-range"
                />
                <div className="bcp-range-marks">
                  <span>0h (Depart)</span>
                  <span>12h</span>
                  <span>24h</span>
                  <span>48h</span>
                </div>
              </div>
            </div>

            {/* Calculation Result */}
            <div className="bcp-sim-result">
              <div className="bcp-matched-slab">
                <span>Matching Slab:</span>
                <b>{simResult.slabName}</b>
              </div>

              <div className="bcp-result-row">
                <span>Cancellation Fee ({simResult.pct}%):</span>
                <b className="text-danger">
                  - ₹{Math.round(simResult.deductionAmt)}
                </b>
              </div>

              <div className="bcp-result-row total">
                <span>Passenger Refund Amount:</span>
                <b className="text-success">
                  ₹{Math.round(simResult.refundAmt)}
                </b>
              </div>
            </div>

            {/* Passenger Boarding Pass Notice Preview */}
            <div className="bcp-ticket-preview">
              <div className="bcp-ticket-preview-header">
                <MdAssignmentTurnedIn />
                <span>Notice on Passenger Ticket</span>
              </div>
              <p>
                "Cancellations requested &gt;24 hrs before departure forfeit{" "}
                {slabs[0]?.deductionPct || 10}%. Cancellations within 2 hrs of
                departure are strictly non-refundable."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add / Edit Slab */}
      {showModal && (
        <div className="bcp-modal-backdrop">
          <div className="bcp-modal">
            <div className="bcp-modal-header">
              <h3>
                {editingSlab
                  ? "Edit Cancellation Slab"
                  : "Add New Cancellation Slab"}
              </h3>
              <button
                className="bcp-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlabForm} className="bcp-modal-body">
              <div className="bcp-form-group">
                <label>Time Window Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Between 12 to 24 hours before departure"
                  value={slabForm.timeFrame}
                  onChange={(e) =>
                    setSlabForm({ ...slabForm, timeFrame: e.target.value })
                  }
                  className="bcp-input"
                />
              </div>

              <div className="bcp-form-row">
                <div className="bcp-form-group">
                  <label>Min Hours Before Dep</label>
                  <input
                    type="number"
                    value={slabForm.minHours}
                    onChange={(e) =>
                      setSlabForm({ ...slabForm, minHours: e.target.value })
                    }
                    className="bcp-input"
                  />
                </div>
                <div className="bcp-form-group">
                  <label>Max Hours Before Dep</label>
                  <input
                    type="number"
                    value={slabForm.maxHours}
                    onChange={(e) =>
                      setSlabForm({ ...slabForm, maxHours: e.target.value })
                    }
                    className="bcp-input"
                  />
                </div>
              </div>

              <div className="bcp-form-row">
                <div className="bcp-form-group">
                  <label>Cancellation Fee (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={slabForm.deductionPct}
                    onChange={(e) =>
                      setSlabForm({
                        ...slabForm,
                        deductionPct: e.target.value,
                      })
                    }
                    className="bcp-input"
                  />
                </div>
                <div className="bcp-form-group">
                  <label>Calculated Refund (%)</label>
                  <input
                    type="number"
                    disabled
                    value={
                      100 -
                      Math.min(
                        100,
                        Math.max(0, Number(slabForm.deductionPct) || 0)
                      )
                    }
                    className="bcp-input disabled"
                  />
                </div>
              </div>

              <div className="bcp-form-group">
                <label>Minimum Fixed Handling Fee (₹)</label>
                <input
                  type="number"
                  placeholder="50"
                  value={slabForm.minFee}
                  onChange={(e) =>
                    setSlabForm({ ...slabForm, minFee: e.target.value })
                  }
                  className="bcp-input"
                />
              </div>

              <div className="bcp-form-group">
                <label>Description / Clause</label>
                <input
                  type="text"
                  placeholder="e.g. Standard early cancellation"
                  value={slabForm.description}
                  onChange={(e) =>
                    setSlabForm({ ...slabForm, description: e.target.value })
                  }
                  className="bcp-input"
                />
              </div>

              <div className="bcp-modal-footer">
                <button
                  type="button"
                  className="bcp-btn bcp-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bcp-btn bcp-btn-primary">
                  {editingSlab ? "Update Slab" : "Save Slab"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
