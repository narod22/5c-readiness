import React, { useState, useMemo } from 'react';

const questions = {
  Context: [
    { type: 'yn', q: 'Is your industry growing or stable (not structurally declining) over the next 5-10 years?' },
    { type: 'yn', q: 'Are there demographic or behavioral tailwinds expanding the category (not just your brand)?' },
    { type: 'yn', q: 'Does customer demand outstrip your current capacity?' },
    { type: 'yn', q: 'Do you have proof of repeat demand (rebooking, retention, repeat purchase, low churn)?' },
    { type: 'yn', q: 'Will customers pay full price consistently (not mainly driven by discounts or promos)?' },
    { type: 'yn', q: 'Is awareness and demand for the category increasing (search trends, media, spend)?' },
    { type: 'yn', q: 'Are there fewer than 3 dominant franchised competitors — or do you have a clear wedge to take share?' },
    { type: 'yn', q: 'Can the concept work across geographies and population densities with the same core unit model?' },
    { type: 'yn', q: 'Is there a credible path to 100+ units within 7-10 years based on TAM and unit economics?' },
    { type: 'yn', q: 'Is the regulatory/licensing environment stable and manageable across most target markets?' },
  ],
  Content: [
    { type: 'yn', q: 'Can you articulate your unique value proposition in one sentence a stranger understands?' },
    { type: 'yn', q: 'Is your brand meaningfully differentiated from franchised competitors (not just "better service")?' },
    { type: 'yn', q: 'Have you carved out a clear niche customers can name — what you\'re "the one" for?' },
    { type: 'yn', q: 'Would the concept still succeed if a competitor copied everything except your brand?' },
    { type: 'yn', q: 'Do you have a registered or registrable trademark for your name and key marks?' },
    { type: 'yn', q: 'Do you have a defined visual identity system (logo, colors, signage, design standards)?' },
    { type: 'yn', q: 'Do you have documented brand standards that enforce consistency across locations?' },
    { type: 'yn', q: 'Do you have franchise-ready marketing assets and a repeatable customer acquisition playbook?' },
    { type: 'yn', q: 'Does your prototype location look professional and credible at first glance?' },
    { type: 'yn', q: 'Is there a believable path to becoming a top-3 brand in your category in most markets you enter?' },
  ],
  Community: [
    { type: 'yn', q: 'Do you have a clearly defined Ideal Franchisee Profile (skills, temperament, capital, goals)?' },
    { type: 'yn', q: 'Have you validated that qualified candidates exist and are you getting unsolicited franchise inquiries?' },
    { type: 'yn', q: 'Can a non-expert learn the system well enough to operate it within 90 days?' },
    { type: 'yn', q: 'Do you have a clear Ideal Customer Profile that franchisees can target locally?' },
    { type: 'yn', q: 'Is the brand genuinely loved (strong reviews, high NPS, repeat rates, low complaints)?' },
    { type: 'yn', q: 'Do customers refer new customers without incentives at meaningful rates?' },
    { type: 'yn', q: 'Is hiring and retaining staff relatively easy — roles don\'t require rare or special credentials?' },
    { type: 'yn', q: 'Do you have a documented hiring and training profile for franchisee-level staff and managers?' },
    { type: 'yn', q: 'Do you have suppliers/vendors who can scale (or a plan to build a consistent vendor network)?' },
    { type: 'yn', q: 'Can your culture and values be taught, measured, and enforced (not just "founder vibes")?' },
  ],
  Chemistry: [
    { type: 'yn', q: 'Do you have a documented operations manual covering all core processes end-to-end?' },
    { type: 'yn', q: 'Is your core tech stack standardized (POS, CRM, scheduling, reporting) and ready to roll out?' },
    { type: 'yn', q: 'Is your initial training program built, sequenced, and ready to deliver with certification?' },
    { type: 'yn', q: 'Are your processes standardized enough to ensure a consistent customer experience everywhere?' },
    { type: 'yn', q: 'Do you have written quality control and compliance checklists (audits, standards, corrective actions)?' },
    { type: 'yn', q: 'Do you have a defined onboarding path from signing to grand opening with timelines and owners?' },
    { type: 'yn', q: 'Do you have a proven site selection and build-out prototype (capex ranges, timeline, specs)?' },
    { type: 'yn', q: 'Do you have a weekly unit KPI dashboard franchisees can run (and you can coach from)?' },
    { type: 'yn', q: 'Can a unit run successfully without the founder on-site for 2-4 weeks?' },
    { type: 'yn', q: 'Do you have a staffed plan for ongoing field support and operator cadence?' },
  ],
  Commerce: [
    { type: 'yn', q: 'Is the prototype unit profitable today (actual, not projected)?' },
    { type: 'yn', q: 'Do you know true unit economics including all major costs (labor, rent, COGS, marketing, utilities)?' },
    { type: 'yn', q: 'Can a franchisee realistically hit ~15%+ ROI after royalties by year 2-3?' },
    { type: 'tiered', q: 'How quickly can a franchisee realistically break even?', options: [
      { label: '<12 mo', value: 'a', points: 1, color: 'green' },
      { label: '<18 mo', value: 'b', points: 0.75, color: 'emerald' },
      { label: '<24 mo', value: 'c', points: 0.5, color: 'yellow' },
      { label: '24+ mo', value: 'd', points: 0, color: 'red' },
    ]},
    { type: 'tiered', q: 'What is the total franchisee investment?', options: [
      { label: '<$250K', value: 'a', points: 1, color: 'green' },
      { label: '<$500K', value: 'b', points: 0.75, color: 'emerald' },
      { label: '<$1M', value: 'c', points: 0.5, color: 'yellow' },
      { label: '$1M+', value: 'd', points: 0, color: 'red' },
    ]},
    { type: 'yn', q: 'After paying royalties, can a typical unit still produce at least 10% operating profit?' },
    { type: 'yn', q: 'Are revenue and margins stable and repeatable (not dependent on one season, client, or channel)?' },
    { type: 'yn', q: 'Do you have 1-5 years of clean financial history suitable for disclosure?' },
    { type: 'yn', q: 'Have you modeled franchisor economics so support is sustainable (fees/royalties vs. support costs)?' },
    { type: 'yn', q: 'Do you have sufficient capital to launch and support franchising before royalty revenue scales?' },
  ]
};

const descriptions = {
  Context: 'Market Timing & Demand — Is the escalator going up?',
  Content: 'Brand Positioning & Differentiation — Is the brand clear, distinct, and defensible?',
  Community: 'ICPs for Franchisees, Customers, Employees, Suppliers — Do you know who this is for?',
  Chemistry: 'Operational Systems & Replicability — Can someone else run this the way you do?',
  Commerce: 'Unit Economics & Financial Viability — Does the math work for everyone?'
};

const cColors = {
  Context: { bg: 'bg-blue-50', border: 'border-blue-500', accent: 'bg-blue-500' },
  Content: { bg: 'bg-purple-50', border: 'border-purple-500', accent: 'bg-purple-500' },
  Community: { bg: 'bg-green-50', border: 'border-green-500', accent: 'bg-green-500' },
  Chemistry: { bg: 'bg-amber-50', border: 'border-amber-500', accent: 'bg-amber-500' },
  Commerce: { bg: 'bg-rose-50', border: 'border-rose-500', accent: 'bg-rose-500' }
};

const tierBtnStyle = (opt, isSelected) => {
  const map = {
    green:   { sel: 'bg-green-600 text-white', hover: 'hover:bg-green-100' },
    emerald: { sel: 'bg-emerald-500 text-white', hover: 'hover:bg-emerald-100' },
    yellow:  { sel: 'bg-yellow-500 text-white', hover: 'hover:bg-yellow-100' },
    red:     { sel: 'bg-red-500 text-white', hover: 'hover:bg-red-100' },
  };
  const s = map[opt.color] || map.green;
  return isSelected ? s.sel : `bg-slate-100 text-slate-600 ${s.hover}`;
};

export default function App() {
  const [answers, setAnswers] = useState({});
  const [activeSection, setActiveSection] = useState('Context');

  const scores = useMemo(() => {
    const result = {};
    let total = 0;
    Object.keys(questions).forEach(section => {
      let pts = 0;
      questions[section].forEach((item, idx) => {
        const key = `${section}-${idx}`;
        const ans = answers[key];
        if (item.type === 'tiered') {
          const sel = item.options.find(o => o.value === ans);
          if (sel) pts += sel.points;
        } else {
          if (ans === true) pts += 1;
        }
      });
      const pct = pts / 10;
      let score;
      if (section === 'Context') score = pct < 0.7 ? -1 : pct * 2;
      else if (section === 'Commerce') score = pct < 0.7 ? -0.5 : pct * 2;
      else score = pct * 2;
      result[section] = { pts, pct, score };
      total += score;
    });
    result.total = total;
    return result;
  }, [answers]);

  const interp = (s) => {
    if (s >= 8) return { label: 'Franchise-Ready', color: 'text-green-600', note: 'Proceed with confidence' };
    if (s >= 6) return { label: 'Strong Foundation', color: 'text-blue-600', note: 'Address gaps before launch' };
    if (s >= 4) return { label: 'Promising but Premature', color: 'text-yellow-600', note: 'Significant work needed' };
    if (s > 0) return { label: 'Not Ready', color: 'text-orange-600', note: 'Revisit fundamentals' };
    return { label: 'Structural Problems', color: 'text-red-600', note: 'Do not proceed' };
  };

  const i = interp(scores.total);
  const answered = Object.keys(answers).filter(k => answers[k] !== null && answers[k] !== undefined).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-slate-800">5C Franchise Readiness Assessment</h1>
          <p className="text-slate-500 text-xs">Powered by the 5C Framework™ — Ranch Advisors</p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase">Total Score</p>
              <p className="text-4xl font-bold text-slate-800">{scores.total.toFixed(1)}</p>
              <p className="text-xs text-slate-400">out of 10</p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${i.color}`}>{i.label}</p>
              <p className="text-slate-500 text-xs">{i.note}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span><span>{answered}/50</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all" style={{ width: `${(answered/50)*100}%` }} />
            </div>
          </div>
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {Object.keys(questions).map(s => {
              const { score, pct } = scores[s] || { score: 0, pct: 0 };
              const pen = (s === 'Context' || s === 'Commerce') && pct < 0.7;
              return (
                <button key={s} onClick={() => setActiveSection(s)}
                  className={`px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                    activeSection === s ? `${cColors[s].accent} text-white` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>
                  {s} <span className={pen ? 'text-red-200' : ''}>{score.toFixed(1)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Section */}
        <div className={`rounded-lg shadow p-4 ${cColors[activeSection].bg} border-l-4 ${cColors[activeSection].border}`}>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-slate-800">{activeSection}</h2>
            <p className="text-slate-600 text-xs">{descriptions[activeSection]}</p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="bg-white px-2 py-0.5 rounded-full">{(scores[activeSection]?.pts || 0).toFixed(2)}/10 pts</span>
              <span className="bg-white px-2 py-0.5 rounded-full">{((scores[activeSection]?.pct || 0)*100).toFixed(0)}%</span>
              <span className={`px-2 py-0.5 rounded-full font-semibold ${
                (activeSection === 'Context' || activeSection === 'Commerce') && (scores[activeSection]?.pct || 0) < 0.7
                  ? 'bg-red-100 text-red-700' : 'bg-white'
              }`}>Score: {(scores[activeSection]?.score || 0).toFixed(2)}</span>
            </div>
            {(activeSection === 'Context' || activeSection === 'Commerce') && (
              <p className="text-xs text-red-600 mt-1">⚠ 70% threshold. Below = {activeSection === 'Context' ? '-1 pt' : '-0.5 pt'}</p>
            )}
          </div>

          <div className="space-y-2">
            {questions[activeSection].map((item, idx) => {
              const key = `${activeSection}-${idx}`;
              const ans = answers[key];

              if (item.type === 'tiered') {
                return (
                  <div key={idx} className="bg-white rounded p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-slate-400 text-xs font-mono w-5 flex-shrink-0">{idx+1}.</span>
                      <p className="flex-1 text-slate-700 text-xs leading-relaxed">{item.q}</p>
                    </div>
                    <div className="flex gap-1 ml-7 flex-wrap">
                      {item.options.map(opt => (
                        <button key={opt.value}
                          onClick={() => setAnswers(p => ({ ...p, [key]: opt.value }))}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${tierBtnStyle(opt, ans === opt.value)}`}>
                          {opt.label} <span className="opacity-60">({opt.points}pt)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="bg-white rounded p-3 flex items-start gap-2">
                  <span className="text-slate-400 text-xs font-mono w-5 flex-shrink-0">{idx+1}.</span>
                  <p className="flex-1 text-slate-700 text-xs leading-relaxed">{item.q}</p>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setAnswers(p => ({ ...p, [key]: true }))}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                        ans === true ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-green-100'
                      }`}>Yes</button>
                    <button onClick={() => setAnswers(p => ({ ...p, [key]: false }))}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                        ans === false ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-red-100'
                      }`}>No</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guide */}
        <div className="bg-white rounded-lg shadow p-4 mt-4">
          <h3 className="font-semibold text-slate-800 text-sm mb-2">Score Guide</h3>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div><span className="font-mono">8-10</span> <span className="text-green-600">Franchise-Ready</span></div>
            <div><span className="font-mono">6-7.9</span> <span className="text-blue-600">Strong Foundation</span></div>
            <div><span className="font-mono">4-5.9</span> <span className="text-yellow-600">Premature</span></div>
            <div><span className="font-mono">&lt;4</span> <span className="text-orange-600">Not Ready</span></div>
            <div className="col-span-2"><span className="font-mono">≤0</span> <span className="text-red-600">Structural Problems</span></div>
          </div>
        </div>
        <div className="text-center mt-4">
          <button onClick={() => setAnswers({})} className="text-slate-500 hover:text-slate-700 text-xs underline">Reset All</button>
        </div>
      </div>
    </div>
  );
}
