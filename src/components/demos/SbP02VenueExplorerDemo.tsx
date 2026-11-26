import React, { useState, useId } from 'react';

type VenueId = 'hose' | 'hnx' | 'upcom';
type SessionMode = 'normal' | 'first';

interface VenueRule {
  name: string;
  normalBand: number;
  firstBand: number;
  refRuleEn: string;
  refRuleVi: string;
}

const VENUES: Record<VenueId, VenueRule> = {
  hose: {
    name: 'HOSE',
    normalBand: 0.07,
    firstBand: 0.20,
    refRuleEn: 'Prior session closing price',
    refRuleVi: 'Giá đóng cửa phiên liền trước',
  },
  hnx: {
    name: 'HNX',
    normalBand: 0.10,
    firstBand: 0.30,
    refRuleEn: 'Prior session closing price',
    refRuleVi: 'Giá đóng cửa phiên liền trước',
  },
  upcom: {
    name: 'UPCoM',
    normalBand: 0.15,
    firstBand: 0.40,
    refRuleEn: 'Prior session weighted-average price',
    refRuleVi: 'Giá bình quân gia quyền phiên trước',
  },
};

function tickSizeFor(venue: VenueId, price: number): number {
  if (venue !== 'hose') return 100;
  if (price < 10_000) return 10;
  if (price < 50_000) return 50;
  return 100;
}

// Round inward toward reference price so the daily band never exceeds the rule cap.
function computeBounds(venue: VenueId, refPrice: number, band: number) {
  const rawCeil = refPrice * (1 + band);
  const rawFloor = refPrice * (1 - band);

  const ceilTick = tickSizeFor(venue, rawCeil);
  const floorTick = tickSizeFor(venue, rawFloor);

  // Round ceiling down to valid tick; handle HOSE boundary just below 50,000 / 10,000
  let ceil = Math.floor(rawCeil / ceilTick) * ceilTick;
  if (venue === 'hose' && ceil >= 50_000 && ceil % 100 !== 0) {
    ceil = Math.floor(rawCeil / 100) * 100;
  }

  let floor = Math.ceil(rawFloor / floorTick) * floorTick;
  if (venue === 'hose' && floor >= 10_000 && floor < 50_000 && floor % 50 !== 0) {
    floor = Math.ceil(rawFloor / 50) * 50;
  }
  if (venue === 'hose' && floor >= 50_000 && floor % 100 !== 0) {
    floor = Math.ceil(rawFloor / 100) * 100;
  }

  return {
    refTick: tickSizeFor(venue, refPrice),
    ceil,
    floor: Math.max(floorTick, floor),
  };
}

const fmt = (n: number, vi: boolean) => n.toLocaleString(vi ? 'vi-VN' : 'en-US');

export default function SbP02VenueExplorerDemo() {
  const refId = useId();
  const [venue, setVenue] = useState<VenueId>('hose');
  const [mode, setMode] = useState<SessionMode>('normal');
  const [rawRef, setRawRef] = useState<number>(25_000);

  const rule = VENUES[venue];
  const refTick = tickSizeFor(venue, rawRef);
  const refPrice = Math.round(rawRef / refTick) * refTick;
  const band = mode === 'normal' ? rule.normalBand : rule.firstBand;
  const { ceil, floor } = computeBounds(venue, refPrice, band);
  const lot100Cost = refPrice * 100;
  const maxSwing100 = (ceil - refPrice) * 100;

  return (
    <div className="sd sbp2d">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Venue</span>
            <span data-lang-vi>Sàn</span>
          </span>
          {(Object.keys(VENUES) as VenueId[]).map((v) => (
            <button
              key={v}
              type="button"
              className={venue === v ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={venue === v}
              onClick={() => setVenue(v)}
            >
              {VENUES[v].name}
            </button>
          ))}
        </div>

        <div className="sd-group">
          <span>
            <span data-lang-en>Session</span>
            <span data-lang-vi>Phiên</span>
          </span>
          <button
            type="button"
            className={mode === 'normal' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={mode === 'normal'}
            onClick={() => setMode('normal')}
          >
            <span data-lang-en>Normal</span>
            <span data-lang-vi>Thường</span>
          </button>
          <button
            type="button"
            className={mode === 'first' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={mode === 'first'}
            onClick={() => setMode('first')}
          >
            <span data-lang-en>First day</span>
            <span data-lang-vi>Chào sàn</span>
          </button>
        </div>
      </div>

      <div className="sbp2d-slider-row">
        <label className="sbp2d-label" htmlFor={refId}>
          <span data-lang-en>Reference price</span>
          <span data-lang-vi>Giá tham chiếu</span>
        </label>
        <output className="sbp2d-out">
          <span data-lang-en>{fmt(refPrice, false)} VND</span>
          <span data-lang-vi>{fmt(refPrice, true)} đồng</span>
        </output>
      </div>
      <input
        id={refId}
        className="sbp2d-range"
        type="range"
        min={5_000}
        max={85_000}
        step={500}
        value={rawRef}
        onChange={(e) => setRawRef(Number(e.currentTarget.value))}
      />
      <div className="sbp2d-scale" aria-hidden="true">
        <span>5,000</span>
        <span>25,000</span>
        <span>50,000</span>
        <span>85,000</span>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b>
            <span data-lang-en>{fmt(ceil, false)} / {fmt(floor, false)}</span>
            <span data-lang-vi>{fmt(ceil, true)} / {fmt(floor, true)}</span>
          </b>
          <span>
            <span data-lang-en>Ceiling (+{Math.round(band * 100)}%) / Floor (−{Math.round(band * 100)}%)</span>
            <span data-lang-vi>Trần (+{Math.round(band * 100)}%) / Sàn (−{Math.round(band * 100)}%)</span>
          </span>
        </div>

        <div className="sd-stat">
          <b>
            <span data-lang-en>{fmt(refTick, false)} VND</span>
            <span data-lang-vi>{fmt(refTick, true)} đồng</span>
          </b>
          <span>
            <span data-lang-en>Tick size at this price</span>
            <span data-lang-vi>Bước giá ở mức giá này</span>
          </span>
        </div>

        <div className="sd-stat">
          <b>
            <span data-lang-en>{fmt(lot100Cost, false)} VND</span>
            <span data-lang-vi>{fmt(lot100Cost, true)} đồng</span>
          </b>
          <span>
            <span data-lang-en>Minimum 100-share lot (±{fmt(maxSwing100, false)}/day)</span>
            <span data-lang-vi>1 lô tối thiểu 100 CP (±{fmt(maxSwing100, true)}/ngày)</span>
          </span>
        </div>
      </div>

      <p className="sbp2d-note">
        <span data-lang-en>Tomorrow's reference rule on {rule.name}: {rule.refRuleEn}.</span>
        <span data-lang-vi>Quy tắc tham chiếu ngày mai trên {rule.name}: {rule.refRuleVi}.</span>
      </p>
    </div>
  );
}
