import React, { useRef, useState } from "react";
import { api } from "../api";
import { useReactionCelebration } from "./ReactionContext";

export const REACTIONS = [
  { id: "love", emoji: "❤️", label: "Love" },
  { id: "fire", emoji: "🔥", label: "Fire" },
  { id: "like", emoji: "👏", label: "Like" },
];

export default function ReactionButtons({ productId, resource = "products", value = {}, onChange, onError }) {
  const { celebrate } = useReactionCelebration();
  const [busy, setBusy] = useState(false);
  const lastClick = useRef(0);

  async function handleReaction(reaction, event) {
    event.preventDefault();
    event.stopPropagation();
    const now = Date.now();
    if (busy || now - lastClick.current < 700) return;
    lastClick.current = now;

    const bounds = event.currentTarget.getBoundingClientRect();
    celebrate(reaction.emoji, {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    });

    setBusy(true);
    try {
      const data = await api(`/${resource}/${productId}/reactions`, {
        method: "POST",
        body: JSON.stringify({ reaction: reaction.id }),
      });
      onChange(data);
    } catch (error) {
      console.error("PRODUCT REACTION ERROR:", error);
      onError?.("Couldn't save reaction. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="reactionButtons" aria-label="Product reactions">
      {REACTIONS.map((reaction) => {
        const selected = value.selected === reaction.id;
        const count = Number(value.reactions?.[reaction.id] || 0);
        return (
          <button
            type="button"
            key={reaction.id}
            className={`reactionButton ${selected ? "active" : ""}`}
            onClick={(event) => handleReaction(reaction, event)}
            aria-label={`React with ${reaction.label}`}
            aria-pressed={selected}
            title={reaction.label}
            disabled={busy}
          >
            <span>{reaction.emoji}</span>
            <small>{count}</small>
          </button>
        );
      })}
    </div>
  );
}
