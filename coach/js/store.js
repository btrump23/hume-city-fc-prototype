/* Hume City FC Coach Dashboard — localStorage data layer (prototype, file:// safe) */
(function (global) {
  var KEY = "hcfc-coach-dashboard-v4";
  var memoryStore = {};
  var storageAvailable = false;
  try {
    var probe = "__hcfc_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    storageAvailable = true;
  } catch (err) {
    storageAvailable = false;
  }
  function storeGet(key) {
    try {
      if (storageAvailable) return localStorage.getItem(key);
    } catch (err) {}
    return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null;
  }
  function storeSet(key, val) {
    try {
      if (storageAvailable) { localStorage.setItem(key, val); return true; }
    } catch (err) {}
    memoryStore[key] = val;
    return false;
  }

  function uid(prefix) {
    return (prefix || "id") + "-" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  function teams() {
    return [
      { id: "t-u9", name: "U9 Girls" },
      { id: "t-u12g", name: "U12 Girls" },
      { id: "t-girls", name: "Girls U8 - U18" },
      { id: "t-u14", name: "Under 14s" },
      { id: "t-u16", name: "U16 Girls" },
      { id: "t-senior", name: "Senior Women" },
      { id: "t-mini", name: "MiniRoo U8 - U12" }
    ];
  }

  function defaultPeriods() {
    return [
      { id: "p-prev", name: "Previous", start: "2025-10-01", end: "2025-12-31" },
      { id: "p-q1", name: "Q1 — Interim", start: "2026-01-01", end: "2026-04-30" },
      { id: "p-q2", name: "Q2 — Mid Season", start: "2026-05-01", end: "2026-07-17" },
      { id: "p-q3", name: "Q3", start: "2026-07-18", end: "2026-09-30" },
      { id: "p-q4", name: "Q4", start: "2026-10-01", end: "2026-12-31" }
    ];
  }

  function defaultMetrics() {
    return [
      { id: "m-sprint", name: "20m sprint", unit: "s", lowerIsBetter: true },
      { id: "m-beep", name: "Beep test level", unit: "level", lowerIsBetter: false },
      { id: "m-jump", name: "Vertical jump", unit: "cm", lowerIsBetter: false },
      { id: "m-agility", name: "Agility T-test", unit: "s", lowerIsBetter: true },
      { id: "m-skills", name: "Skills rating", unit: "1-5", lowerIsBetter: false }
    ];
  }


  function defaultTests() {
    return [
      { id: "ft-situps", group: "fitness", name: "Sit-ups", unit: "reps", lowerIsBetter: false },
      { id: "ft-starjumps", group: "fitness", name: "Star jumps", unit: "reps", lowerIsBetter: false },
      { id: "ft-squats", group: "fitness", name: "Squats", unit: "reps", lowerIsBetter: false },
      { id: "ft-barrier", group: "fitness", name: "Over barrier", unit: "reps", lowerIsBetter: false },
      { id: "ft-sprint", group: "fitness", name: "20m sprint", unit: "s", lowerIsBetter: true },
      { id: "ft-beep", group: "fitness", name: "Beep test", unit: "level", lowerIsBetter: false },
      { id: "ft-plank", group: "fitness", name: "Plank", unit: "s", lowerIsBetter: false },
      { id: "ft-juggle", group: "ball", name: "Juggling", unit: "reps", lowerIsBetter: false },
      { id: "ft-passing", group: "ball", name: "Passing accuracy", unit: "/10", lowerIsBetter: false },
      { id: "ft-dribble", group: "ball", name: "Dribbling", unit: "s", lowerIsBetter: true },
      { id: "ft-firsttouch", group: "ball", name: "First touch", unit: "/10", lowerIsBetter: false }
    ];
  }

  function defaultCoaches() {
    return [
      { id: "coach-ozzi", name: "Ozzi", role: "Technical Director & Senior Women coach", email: "td@humecityfc.com", phone: "[Phone number]", teamId: "t-senior", canViewAll: true },
      { id: "coach-selena", name: "Selena", role: "Under 9 girls coach", email: "coach.u9girls@example.com", phone: "[Phone number]", teamId: "t-u9", canViewAll: false },
      { id: "coach-david", name: "David Crisp", role: "U12 Girls coach", email: "coach.u12girls@example.com", phone: "[Phone number]", teamId: "t-u12g", canViewAll: false },
      { id: "coach-u14", name: "Sample Coach C", role: "Under 14s coach", email: "coach.u14s@example.com", phone: "[Phone number]", teamId: "t-u14", canViewAll: false },
      { id: "coach-girls", name: "Sample Coach A", role: "Girls U8-U18 coach", email: "coach.girls@example.com", phone: "[Phone number]", teamId: "t-girls", canViewAll: false },
      { id: "coach-u16", name: "Sample Coach B", role: "U16 Girls coach", email: "coach.u16@example.com", phone: "[Phone number]", teamId: "t-u16", canViewAll: false },
      { id: "coach-mini", name: "Sample Coach D", role: "MiniRoo U8-U12 coach", email: "coach.miniroo@example.com", phone: "[Phone number]", teamId: "t-mini", canViewAll: false }
    ];
  }

  function phone(n) {
    var s = String(n).padStart(3, "0");
    return "0400 000 " + s;
  }

  function makePlayer(n, teamId, extras) {
    var id = "pl-" + String(n).padStart(2, "0");
    var p = {
      id: id,
      teamId: teamId,
      name: "Sample Player " + String(n).padStart(2, "0"),
      email: "sample.player" + String(n).padStart(2, "0") + "@example.com",
      guardian1: {
        name: "Sample Guardian " + String(n).padStart(2, "0") + "A",
        relationship: n % 2 ? "Parent" : "Guardian",
        email: "guardian" + String(n).padStart(2, "0") + "a@example.com",
        phone: phone(n)
      },
      guardian2: n % 3 === 0 ? {
        name: "Sample Guardian " + String(n).padStart(2, "0") + "B",
        relationship: "Parent",
        email: "guardian" + String(n).padStart(2, "0") + "b@example.com",
        phone: phone(100 + n)
      } : { name: "", relationship: "", email: "", phone: "" },
      feeStatus: ["Paid", "Paid", "Part paid", "Unpaid", "Paid"][n % 5],
      feeAmount: [0, 0, 80, 160, 0][n % 5],
      feeDate: n % 5 <= 1 || n % 5 === 4 ? "2026-02-14" : (n % 5 === 2 ? "2026-03-02" : ""),
      uniformOrder: ["Arrived", "Arrived", "Ordered", "Not ordered", "Arrived"][n % 5],
      uniformCollection: ["Collected", "Not collected", "Not collected", "Not collected", "Collected"][n % 5],
      uniformSize: ["YS", "YM", "YL", "S", "M", "L", "XS", "XL"][n % 8]
    };
    if (extras) Object.keys(extras).forEach(function (k) { p[k] = extras[k]; });
    return p;
  }

  function seed() {
    var t = teams();
    var players = [];
    var i;
    for (i = 1; i <= 8; i++) players.push(makePlayer(i, "t-girls"));
    for (i = 9; i <= 13; i++) players.push(makePlayer(i, "t-u16"));
    for (i = 14; i <= 19; i++) players.push(makePlayer(i, "t-senior"));
    for (i = 20; i <= 24; i++) players.push(makePlayer(i, "t-mini"));
    for (i = 25; i <= 30; i++) players.push(makePlayer(i, "t-u9"));
    for (i = 31; i <= 36; i++) players.push(makePlayer(i, "t-u14"));

    // U12 Girls players are loaded from the encrypted vault after login.

    var sessions = [
      { id: "s1", teamId: "t-girls", date: "2026-10-14", type: "Training" },
      { id: "s2", teamId: "t-girls", date: "2026-10-18", type: "Match" },
      { id: "s3", teamId: "t-girls", date: "2026-10-21", type: "Training" },
      { id: "s4", teamId: "t-girls", date: "2026-10-25", type: "Match" },
      { id: "s5", teamId: "t-girls", date: "2026-10-28", type: "Training" },
      { id: "s6", teamId: "t-girls", date: "2026-11-01", type: "Match" },
      { id: "s7", teamId: "t-girls", date: "2026-11-04", type: "Training" },
      { id: "s8", teamId: "t-girls", date: "2026-11-11", type: "Training" },
      { id: "s9", teamId: "t-u16", date: "2026-10-21", type: "Training" },
      { id: "s10", teamId: "t-u16", date: "2026-10-25", type: "Match" },
      { id: "s11", teamId: "t-senior", date: "2026-10-18", type: "Match" },
      { id: "s12", teamId: "t-senior", date: "2026-10-22", type: "Training" },
      { id: "s13", teamId: "t-mini", date: "2026-10-17", type: "Training" },
      { id: "s-u9-t1", teamId: "t-u9", date: "2026-02-03", type: "Training" },
      { id: "s-u9-m1", teamId: "t-u9", date: "2026-02-07", type: "Match" },
      { id: "s-u9-t2", teamId: "t-u9", date: "2026-02-17", type: "Training" },
      { id: "s-u9-m2", teamId: "t-u9", date: "2026-02-21", type: "Match" },
      { id: "s-u9-t3", teamId: "t-u9", date: "2026-03-10", type: "Training" },
      { id: "s-u9-t4", teamId: "t-u9", date: "2026-04-07", type: "Training" },
      { id: "s-u9-t5", teamId: "t-u9", date: "2026-05-12", type: "Training" },
      { id: "s-u9-m3", teamId: "t-u9", date: "2026-05-16", type: "Match" },
      { id: "s-u9-t6", teamId: "t-u9", date: "2026-06-02", type: "Training" },
      { id: "s-u9-m4", teamId: "t-u9", date: "2026-06-06", type: "Match" },
      { id: "s-u9-t7", teamId: "t-u9", date: "2026-06-23", type: "Training" },
      { id: "s-u9-t8", teamId: "t-u9", date: "2026-07-07", type: "Training" },
      { id: "s-u14-t1", teamId: "t-u14", date: "2026-02-04", type: "Training" },
      { id: "s-u14-m1", teamId: "t-u14", date: "2026-02-08", type: "Match" },
      { id: "s-u14-t2", teamId: "t-u14", date: "2026-02-18", type: "Training" },
      { id: "s-u14-m2", teamId: "t-u14", date: "2026-02-22", type: "Match" },
      { id: "s-u14-t3", teamId: "t-u14", date: "2026-03-11", type: "Training" },
      { id: "s-u14-t4", teamId: "t-u14", date: "2026-04-08", type: "Training" },
      { id: "s-u14-t5", teamId: "t-u14", date: "2026-05-13", type: "Training" },
      { id: "s-u14-m3", teamId: "t-u14", date: "2026-05-17", type: "Match" },
      { id: "s-u14-t6", teamId: "t-u14", date: "2026-06-03", type: "Training" },
      { id: "s-u14-m4", teamId: "t-u14", date: "2026-06-07", type: "Match" },
      { id: "s-u14-t7", teamId: "t-u14", date: "2026-06-24", type: "Training" },
      { id: "s-u14-t8", teamId: "t-u14", date: "2026-07-08", type: "Training" },
      { id: "s-u12-t1", teamId: "t-u12g", date: "2026-02-03", type: "Training" },
      { id: "s-u12-m1", teamId: "t-u12g", date: "2026-02-07", type: "Match" },
      { id: "s-u12-t2", teamId: "t-u12g", date: "2026-02-17", type: "Training" },
      { id: "s-u12-m2", teamId: "t-u12g", date: "2026-02-21", type: "Match" },
      { id: "s-u12-t3", teamId: "t-u12g", date: "2026-03-03", type: "Training" },
      { id: "s-u12-m3", teamId: "t-u12g", date: "2026-03-07", type: "Match" },
      { id: "s-u12-t4", teamId: "t-u12g", date: "2026-03-17", type: "Training" },
      { id: "s-u12-m4", teamId: "t-u12g", date: "2026-03-21", type: "Match" },
      { id: "s-u12-t5", teamId: "t-u12g", date: "2026-04-14", type: "Training" },
      { id: "s-u12-m5", teamId: "t-u12g", date: "2026-04-18", type: "Match" },
      { id: "s-u12-t6", teamId: "t-u12g", date: "2026-05-05", type: "Training" },
      { id: "s-u12-m6", teamId: "t-u12g", date: "2026-05-09", type: "Match" },
      { id: "s-u12-t7", teamId: "t-u12g", date: "2026-05-19", type: "Training" },
      { id: "s-u12-m7", teamId: "t-u12g", date: "2026-05-23", type: "Match" },
      { id: "s-u12-t8", teamId: "t-u12g", date: "2026-06-02", type: "Training" },
      { id: "s-u12-m8", teamId: "t-u12g", date: "2026-06-06", type: "Match" },
      { id: "s-u12-t9", teamId: "t-u12g", date: "2026-06-16", type: "Training" },
      { id: "s-u12-m9", teamId: "t-u12g", date: "2026-06-20", type: "Match" },
      { id: "s-u12-t10", teamId: "t-u12g", date: "2026-07-14", type: "Training" },
      { id: "s-u12-m10", teamId: "t-u12g", date: "2026-07-18", type: "Match" },
      { id: "s-u12-t11", teamId: "t-u12g", date: "2026-08-04", type: "Training" },
      { id: "s-u12-m11", teamId: "t-u12g", date: "2026-08-08", type: "Match" },
      { id: "s-g-t1", teamId: "t-girls", date: "2026-02-03", type: "Training" },
      { id: "s-g-m1", teamId: "t-girls", date: "2026-02-07", type: "Match" },
      { id: "s-g-t2", teamId: "t-girls", date: "2026-03-10", type: "Training" },
      { id: "s-g-m2", teamId: "t-girls", date: "2026-03-14", type: "Match" },
      { id: "s-g-t3", teamId: "t-girls", date: "2026-05-12", type: "Training" },
      { id: "s-g-m3", teamId: "t-girls", date: "2026-05-16", type: "Match" },
      { id: "s-g-t4", teamId: "t-girls", date: "2026-06-23", type: "Training" },
      { id: "s-g-m4", teamId: "t-girls", date: "2026-06-27", type: "Match" }
    ];

    var attendance = [];
    sessions.forEach(function (s) {
      players.filter(function (p) { return p.teamId === s.teamId; }).forEach(function (p, idx) {
        var present = !(((Number(p.id.slice(3)) * 3) + Number(String(s.date).slice(-2)) + idx) % 5 === 0);
        attendance.push({ sessionId: s.id, playerId: p.id, present: present });
      });
    });

    var periods = defaultPeriods();
    var metrics = defaultMetrics();
    var assessments = [];
    function val(metric, n, periodIndex) {
      var base = {
        "m-sprint": 3.9 + (n % 5) * 0.12,
        "m-beep": 8.2 + (n % 6) * 0.4,
        "m-jump": 32 + (n % 7) * 1.5,
        "m-agility": 11.8 + (n % 4) * 0.2,
        "m-skills": 3 + (n % 3)
      }[metric];
      var delta = periodIndex * (metric === "m-sprint" || metric === "m-agility" ? -0.08 : 0.35);
      if (n % 11 === 0 && periodIndex === 1) delta = metric === "m-sprint" || metric === "m-agility" ? 0.15 : -0.4;
      return Math.round((base + delta) * 100) / 100;
    }
    players.forEach(function (p) {
      var n = Number(p.id.slice(3));
      [0, 1, 2].forEach(function (pi) {
        metrics.forEach(function (m) {
          assessments.push({ playerId: p.id, periodId: periods[pi].id, metricId: m.id, value: val(m.id, n, pi) });
        });
      });
    });


    var tests = defaultTests();
    var testResults = [];
    function sampleTestVal(testId, n, periodIndex) {
      var base = {
        "ft-situps": 16 + (n % 7),
        "ft-starjumps": 22 + (n % 8),
        "ft-squats": 18 + (n % 6),
        "ft-barrier": 10 + (n % 5),
        "ft-sprint": 4.55 - (n % 6) * 0.08,
        "ft-beep": 5.8 + (n % 7) * 0.3,
        "ft-plank": 28 + (n % 9) * 2,
        "ft-juggle": 6 + (n % 8),
        "ft-passing": 5 + (n % 5),
        "ft-dribble": 15.2 - (n % 6) * 0.25,
        "ft-firsttouch": 5 + (n % 5)
      }[testId];
      var lower = testId === "ft-sprint" || testId === "ft-dribble";
      var delta = periodIndex * (lower ? -0.12 : (testId.indexOf("beep") >= 0 || testId.indexOf("plank") >= 0 ? 0.6 : 1));
      if (n % 5 === 0 && periodIndex === 1) delta = lower ? 0.2 : -1;
      if (n % 7 === 0 && periodIndex === 1) delta = lower ? -0.25 : 2;
      var v = base + delta;
      if (testId === "ft-passing" || testId === "ft-firsttouch") v = Math.max(0, Math.min(10, Math.round(v)));
      else if (testId === "ft-sprint" || testId === "ft-dribble" || testId === "ft-beep") v = Math.round(v * 100) / 100;
      else v = Math.round(v);
      return v;
    }
    var assessTeams = { "t-u9": true, "t-u12g": true, "t-u14": true, "t-girls": true };
    players.forEach(function (p) {
      if (!assessTeams[p.teamId]) return;
      var n = Number(p.id.slice(3));
      [0, 1].forEach(function (pi) {
        var periodId = pi === 0 ? "p-q1" : "p-q2";
        tests.forEach(function (t) {
          var carried = (p.id === "pl-27" && pi === 1 && (t.id === "ft-sprint" || t.id === "ft-plank"));
          var value = carried ? sampleTestVal(t.id, n, 0) : sampleTestVal(t.id, n, pi);
          testResults.push({ playerId: p.id, periodId: periodId, testId: t.id, value: value, carriedForward: carried });
        });
      });
    });

    function sampleCard(playerId, periodId, rating, fitnessStatus, ballStatus, notes) {
      return {
        id: "rc-" + playerId + "-" + periodId,
        playerId: playerId,
        periodId: periodId,
        overallRating: rating,
        notes: notes || "",
        criteria: {
          attendance: { status: "ON TRACK", feedback: "SAMPLE: No concerns this period." },
          fitness: { status: fitnessStatus, feedback: "SAMPLE: Keep building consistency across the seven fitness tests." },
          ballSkills: { status: ballStatus, feedback: "SAMPLE: Continue weekly practice on passing accuracy and dribbling." },
          gameDay: { status: "ON TRACK", feedback: "SAMPLE: Solid contribution. Even better — stay involved when the ball is on the far side." },
          attitude: { status: "ON TRACK", feedback: "SAMPLE: Positive at training and on game days." },
          parents: { status: "ON TRACK", feedback: "SAMPLE: No concerns this period." }
        }
      };
    }
    var reportCards = [];
    ["t-u9", "t-u12g", "t-u14", "t-girls"].forEach(function (tid) {
      players.filter(function (p) { return p.teamId === tid; }).forEach(function (p, idx) {
        var rating = ["ON TRACK", "ON TRACK", "EXCEEDING", "ON TRACK", "NEEDS FOCUS", "ON TRACK"][idx % 6];
        var fit = rating === "EXCEEDING" ? "EXCEEDING" : (rating === "NEEDS FOCUS" ? "NEEDS FOCUS" : "ON TRACK");
        var ball = idx % 4 === 2 ? "NEEDS FOCUS" : (idx % 5 === 0 ? "EXCEEDING" : "ON TRACK");
        var noteQ2 = p.id === "pl-27" ? "SAMPLE: Missed the Mid Season test day (soreness). Previous results carried forward for 20m sprint and Plank." : "";
        reportCards.push(sampleCard(p.id, "p-q1", "ON TRACK", "ON TRACK", ball, ""));
        reportCards.push(sampleCard(p.id, "p-q2", rating, fit, ball, noteQ2));
      });
    });

    var medical = [
      { id: "med-1", playerId: "pl-02", date: "2026-11-08", type: "Ankle knock (sample)", description: "SAMPLE ONLY. Sore left ankle after training. RICE started. Not a real injury record.", status: "Recovering", needsFollowUp: true, followUpDate: "2026-11-22" },
      { id: "med-2", playerId: "pl-05", date: "2026-10-12", type: "Cold (sample)", description: "SAMPLE ONLY. Missed one session with a cold. Cleared the following week.", status: "Cleared", needsFollowUp: false, followUpDate: "" },
      { id: "med-3", playerId: "pl-10", date: "2026-11-15", type: "Knee tightness (sample)", description: "SAMPLE ONLY. Tightness after a match. Monitor at next training.", status: "Active", needsFollowUp: true, followUpDate: "2026-11-23" }
    ];

    var matches = [
      { id: "m-1", teamId: "t-girls", date: "2026-10-18", opponent: "Sample United", homeAway: "Home", scoreFor: 3, scoreAgainst: 1, result: "W" },
      { id: "m-2", teamId: "t-girls", date: "2026-10-25", opponent: "Example Athletic", homeAway: "Away", scoreFor: 1, scoreAgainst: 1, result: "D" },
      { id: "m-3", teamId: "t-girls", date: "2026-11-01", opponent: "Placeholder Rovers", homeAway: "Home", scoreFor: 0, scoreAgainst: 2, result: "L" },
      { id: "m-4", teamId: "t-u16", date: "2026-10-25", opponent: "Sample City", homeAway: "Home", scoreFor: 2, scoreAgainst: 0, result: "W" },
      { id: "m-5", teamId: "t-senior", date: "2026-10-18", opponent: "Example FC", homeAway: "Away", scoreFor: 1, scoreAgainst: 0, result: "W" },
      { id: "m-u12-1", teamId: "t-u12g", date: "2026-02-07", opponent: "Sample United", homeAway: "Home", scoreFor: 2, scoreAgainst: 1, result: "W" },
      { id: "m-u12-2", teamId: "t-u12g", date: "2026-02-21", opponent: "Example Athletic", homeAway: "Away", scoreFor: 1, scoreAgainst: 1, result: "D" },
      { id: "m-u12-3", teamId: "t-u12g", date: "2026-03-07", opponent: "Placeholder Rovers", homeAway: "Home", scoreFor: 3, scoreAgainst: 0, result: "W" },
      { id: "m-u12-4", teamId: "t-u12g", date: "2026-03-21", opponent: "Sample City", homeAway: "Away", scoreFor: 0, scoreAgainst: 2, result: "L" },
      { id: "m-u12-5", teamId: "t-u12g", date: "2026-04-18", opponent: "Northside Sample", homeAway: "Home", scoreFor: 2, scoreAgainst: 2, result: "D" },
      { id: "m-u12-6", teamId: "t-u12g", date: "2026-05-09", opponent: "Valley Exemplar", homeAway: "Away", scoreFor: 4, scoreAgainst: 1, result: "W" },
      { id: "m-u12-7", teamId: "t-u12g", date: "2026-05-23", opponent: "Creek Placeholders", homeAway: "Home", scoreFor: 1, scoreAgainst: 0, result: "W" },
      { id: "m-u12-8", teamId: "t-u12g", date: "2026-06-06", opponent: "Demo Rangers", homeAway: "Away", scoreFor: 2, scoreAgainst: 3, result: "L" }
    ];
    var matchStats = [
      { matchId: "m-1", playerId: "pl-01", goals: 1, assists: 1, minutes: 70 },
      { matchId: "m-1", playerId: "pl-03", goals: 2, assists: 0, minutes: 80 },
      { matchId: "m-1", playerId: "pl-04", goals: 0, assists: 1, minutes: 65 },
      { matchId: "m-2", playerId: "pl-01", goals: 0, assists: 1, minutes: 80 },
      { matchId: "m-2", playerId: "pl-07", goals: 1, assists: 0, minutes: 70 },
      { matchId: "m-3", playerId: "pl-03", goals: 0, assists: 0, minutes: 80 },
      { matchId: "m-4", playerId: "pl-09", goals: 1, assists: 1, minutes: 80 },
      { matchId: "m-4", playerId: "pl-11", goals: 1, assists: 0, minutes: 60 },
      { matchId: "m-5", playerId: "pl-14", goals: 1, assists: 0, minutes: 90 },
      { matchId: "m-u12-1", playerId: "pl-37", goals: 1, assists: 0, minutes: 50 },
      { matchId: "m-u12-1", playerId: "pl-39", goals: 1, assists: 1, minutes: 50 },
      { matchId: "m-u12-3", playerId: "pl-41", goals: 2, assists: 0, minutes: 50 },
      { matchId: "m-u12-3", playerId: "pl-37", goals: 1, assists: 1, minutes: 40 },
      { matchId: "m-u12-6", playerId: "pl-43", goals: 2, assists: 1, minutes: 50 },
      { matchId: "m-u12-6", playerId: "pl-45", goals: 1, assists: 1, minutes: 40 },
      { matchId: "m-u12-6", playerId: "pl-39", goals: 1, assists: 0, minutes: 40 },
      { matchId: "m-u12-7", playerId: "pl-47", goals: 1, assists: 0, minutes: 50 }
    ];

    var fixtures = [
      { id: "fx-1", teamId: "t-girls", date: "2026-11-22", time: "10:00", round: "Sample R12", homeTeam: "Hume City FC Girls U8 - U18 (sample)", awayTeam: "Sample United", venue: "Sample Ground 1", field: "Pitch 2", competition: "Sample League", ageGroup: "Girls U8 - U18", isSample: true, matchId: "" },
      { id: "fx-2", teamId: "t-girls", date: "2026-11-29", time: "10:00", round: "Sample R13", homeTeam: "Example Athletic", awayTeam: "Hume City FC Girls U8 - U18 (sample)", venue: "Sample Ground 2", field: "Main", competition: "Sample League", ageGroup: "Girls U8 - U18", isSample: true, matchId: "" },
      { id: "fx-3", teamId: "t-girls", date: "2026-12-06", time: "11:30", round: "Sample R14", homeTeam: "Hume City FC Girls U8 - U18 (sample)", awayTeam: "Placeholder Rovers", venue: "Sample Ground 1", field: "Pitch 1", competition: "Sample League", ageGroup: "Girls U8 - U18", isSample: true, matchId: "" },
      { id: "fx-4", teamId: "t-u16", date: "2026-11-22", time: "12:30", round: "Sample R12", homeTeam: "Sample City", awayTeam: "Hume City FC U16 Girls (sample)", venue: "Sample Ground 3", field: "Pitch 1", competition: "Sample U16 League", ageGroup: "U16 Girls", isSample: true, matchId: "" },
      { id: "fx-5", teamId: "t-senior", date: "2026-11-21", time: "15:00", round: "Sample R14", homeTeam: "Hume City FC Senior Women (sample)", awayTeam: "Example FC", venue: "Sample Ground 1", field: "Main", competition: "State League North-West 4 (sample)", ageGroup: "Senior Women", isSample: true, matchId: "" },
      { id: "fx-6", teamId: "t-mini", date: "2026-11-28", time: "09:00", round: "Sample festival", homeTeam: "MiniRoo U8 - U12 (sample)", awayTeam: "Sample MiniRoos", venue: "Sample Ground 1", field: "Mini 3", competition: "MiniRoo (sample)", ageGroup: "MiniRoo U8 - U12", isSample: true, matchId: "" },
      { id: "fx-past", teamId: "t-girls", date: "2026-11-01", time: "10:00", round: "Sample R11", homeTeam: "Hume City FC Girls U8 - U18 (sample)", awayTeam: "Placeholder Rovers", venue: "Sample Ground 1", field: "Pitch 2", competition: "Sample League", ageGroup: "Girls U8 - U18", isSample: true, matchId: "m-3" },
      { id: "fx-u12-1", teamId: "t-u12g", date: "2026-02-07", time: "10:00", round: "Sample R1", homeTeam: "Hume City FC U12 Girls (sample)", awayTeam: "Sample United", venue: "Sample Ground 1", field: "Pitch 3", competition: "Sample U12 Girls league", ageGroup: "U12 Girls", isSample: true, matchId: "m-u12-1" },
      { id: "fx-u12-2", teamId: "t-u12g", date: "2026-02-21", time: "10:00", round: "Sample R3", homeTeam: "Example Athletic", awayTeam: "Hume City FC U12 Girls (sample)", venue: "Sample Ground 2", field: "Main", competition: "Sample U12 Girls league", ageGroup: "U12 Girls", isSample: true, matchId: "m-u12-2" },
      { id: "fx-u12-3", teamId: "t-u12g", date: "2026-03-07", time: "10:00", round: "Sample R5", homeTeam: "Hume City FC U12 Girls (sample)", awayTeam: "Placeholder Rovers", venue: "Sample Ground 1", field: "Pitch 3", competition: "Sample U12 Girls league", ageGroup: "U12 Girls", isSample: true, matchId: "m-u12-3" },
      { id: "fx-u12-4", teamId: "t-u12g", date: "2026-03-21", time: "11:30", round: "Sample R7", homeTeam: "Sample City", awayTeam: "Hume City FC U12 Girls (sample)", venue: "Sample Ground 3", field: "Pitch 1", competition: "Sample U12 Girls league", ageGroup: "U12 Girls", isSample: true, matchId: "m-u12-4" },
      { id: "fx-u12-5", teamId: "t-u12g", date: "2026-04-18", time: "10:00", round: "Sample R9", homeTeam: "Hume City FC U12 Girls (sample)", awayTeam: "Northside Sample", venue: "Sample Ground 1", field: "Pitch 3", competition: "Sample U12 Girls league", ageGroup: "U12 Girls", isSample: true, matchId: "m-u12-5" },
      { id: "fx-u12-6", teamId: "t-u12g", date: "2026-05-09", time: "10:00", round: "Sample R11", homeTeam: "Valley Exemplar", awayTeam: "Hume City FC U12 Girls (sample)", venue: "Sample Ground 4", field: "Main", competition: "Sample U12 Girls league", ageGroup: "U12 Girls", isSample: true, matchId: "m-u12-6" },
      { id: "fx-u12-7", teamId: "t-u12g", date: "2026-05-23", time: "10:00", round: "Sample R13", homeTeam: "Hume City FC U12 Girls (sample)", awayTeam: "Creek Placeholders", venue: "Sample Ground 1", field: "Pitch 2", competition: "Sample U12 Girls league", ageGroup: "U12 Girls", isSample: true, matchId: "m-u12-7" },
      { id: "fx-u12-8", teamId: "t-u12g", date: "2026-06-06", time: "10:00", round: "Sample R15", homeTeam: "Demo Rangers", awayTeam: "Hume City FC U12 Girls (sample)", venue: "Sample Ground 5", field: "Pitch 1", competition: "Sample U12 Girls league", ageGroup: "U12 Girls", isSample: true, matchId: "m-u12-8" },
      { id: "fx-u12-9", teamId: "t-u12g", date: "2026-06-20", time: "10:00", round: "Sample R17", homeTeam: "Hume City FC U12 Girls (sample)", awayTeam: "Sample United", venue: "Sample Ground 1", field: "Pitch 3", competition: "Sample U12 Girls league", ageGroup: "U12 Girls", isSample: true, matchId: "" },
      { id: "fx-u12-10", teamId: "t-u12g", date: "2026-07-18", time: "10:00", round: "Sample R19", homeTeam: "Example Athletic", awayTeam: "Hume City FC U12 Girls (sample)", venue: "Sample Ground 2", field: "Main", competition: "Sample U12 Girls league", ageGroup: "U12 Girls", isSample: true, matchId: "" },
      { id: "fx-u12-11", teamId: "t-u12g", date: "2026-08-08", time: "10:00", round: "Sample R21", homeTeam: "Hume City FC U12 Girls (sample)", awayTeam: "Placeholder Rovers", venue: "Sample Ground 1", field: "Pitch 3", competition: "Sample U12 Girls league", ageGroup: "U12 Girls", isSample: true, matchId: "" }
    ];

    var sessionPlans = [
      {
        id: "sp-1", teamId: "t-girls", week: "Week 8 (sample)", date: "2026-11-18",
        theme: "SAMPLE: Playing forward after winning the ball",
        warmup: "8 min rondo in a 12x12 grid, then dynamic stretches. (Sample plan — replace.)",
        activities: [
          { name: "Passing under pressure (sample)", duration: "12 min" },
          { name: "3v2 to a target player (sample)", duration: "15 min" }
        ],
        game: "5v5 directional game, two mini-goals. 16 min.",
        cooldown: "Light jog, stretch, two-sentence recap.",
        equipment: "12 cones, 10 bibs, 8 balls, 2 mini-goals",
        notes: "SAMPLE NOTES only. Check medical flags before the session."
      }
    ];

    var equipment = [
      { id: "eq-1", teamId: "t-girls", item: "Training balls (sample)", quantity: 12, condition: "Good", location: "Sample shed A", checked: true, lastChecked: "2026-11-11" },
      { id: "eq-2", teamId: "t-girls", item: "Bibs — red (sample)", quantity: 15, condition: "Fair", location: "Sample kit bag", checked: true, lastChecked: "2026-11-11" },
      { id: "eq-3", teamId: "t-girls", item: "Cones (sample)", quantity: 40, condition: "Good", location: "Sample shed A", checked: false, lastChecked: "2026-10-14" },
      { id: "eq-4", teamId: "t-girls", item: "First aid kit (sample)", quantity: 1, condition: "Needs restock (sample)", location: "Sample coach bag", checked: true, lastChecked: "2026-11-04" },
      { id: "eq-5", teamId: "t-u16", item: "Training balls (sample)", quantity: 10, condition: "Good", location: "Sample shed B", checked: true, lastChecked: "2026-11-04" },
      { id: "eq-u12-1", teamId: "t-u12g", item: "Training balls (sample)", quantity: 12, condition: "Good", location: "Sample U12 kit bag", checked: true, lastChecked: "2026-05-19" },
      { id: "eq-u12-2", teamId: "t-u12g", item: "Bibs — red (sample)", quantity: 16, condition: "Good", location: "Sample U12 kit bag", checked: true, lastChecked: "2026-05-19" },
      { id: "eq-u12-3", teamId: "t-u12g", item: "Cones (sample)", quantity: 30, condition: "Fair", location: "Sample shed A", checked: false, lastChecked: "2026-04-14" },
      { id: "eq-u12-4", teamId: "t-u12g", item: "First aid kit (sample)", quantity: 1, condition: "Good", location: "Sample coach bag", checked: true, lastChecked: "2026-05-05" }
    ];

    var developmentNotes = [
      { id: "dn-1", playerId: "pl-01", date: "2026-10-20", text: "SAMPLE NOTE: Confident on the ball in tight areas. Next step: earlier forward pass." },
      { id: "dn-2", playerId: "pl-03", date: "2026-11-02", text: "SAMPLE NOTE: Led the press well. Work on weaker-foot finishing this month." },
      { id: "dn-3", playerId: "pl-09", date: "2026-10-26", text: "SAMPLE NOTE: Strong in 1v1 defending. Encourage more communication." },
      { id: "dn-u12-1", playerId: "pl-37", date: "2026-03-10", text: "SAMPLE NOTE: Bright first touch in tight spaces. Next step: play forward earlier." },
      { id: "dn-u12-2", playerId: "pl-43", date: "2026-05-12", text: "SAMPLE NOTE: Led the press well at the weekend. Work on weaker-foot passing this block." },
      { id: "dn-u12-3", playerId: "pl-45", date: "2026-06-02", text: "SAMPLE NOTE: Calm under high balls. Encourage her to organise the back line." }
    ];

    var comms = [
      { id: "c-1", playerId: "pl-01", date: "2026-11-10", method: "Email", summary: "SAMPLE: Sent training time reminder.", followUpNeeded: false },
      { id: "c-2", playerId: "pl-02", date: "2026-10-05", method: "Phone", summary: "SAMPLE: Discussed return-to-play after a knock. Follow up still open.", followUpNeeded: true },
      { id: "c-3", playerId: "pl-04", date: "2026-11-12", method: "In person", summary: "SAMPLE: Quick chat at training about fees instalment.", followUpNeeded: false },
      { id: "c-4", playerId: "pl-09", date: "2026-09-30", method: "SMS", summary: "SAMPLE: Confirmed fixture venue. No contact since (highlight test).", followUpNeeded: false },
      { id: "c-u12-1", playerId: "pl-37", date: "2026-05-20", method: "Email", summary: "SAMPLE: Sent the food / ref / POTM roster for the next four rounds.", followUpNeeded: false },
      { id: "c-u12-2", playerId: "pl-40", date: "2026-04-10", method: "Phone", summary: "SAMPLE: Confirmed Saturday food duty. Follow up still open on uniform size.", followUpNeeded: true },
      { id: "c-u12-3", playerId: "pl-48", date: "2026-06-01", method: "In person", summary: "SAMPLE: Quick chat after training about the mid-season campaign block.", followUpNeeded: false }
    ];


    var taskSets = [
      {
        id: "ts-summer",
        teamId: "t-girls",
        name: "Summer Break Tasks (sample)",
        source: "U11 Girls coaching staff",
        createdDate: "2024-12-21",
        dueDate: "2025-01-27",
        notes: "Sample set based on a U11 Girls summer break task sheet from the 2024–25 break. Real player names have been left out. Players were asked to rest up, then do these tasks at least twice a week. Coaches planned to review them when the group returned. Training was due to restart on Tuesday 28 January 2025, on Tuesday and Thursday evenings, 5:45pm to 6:50pm. Parents were asked to join the team's Team App and post their daughter's name. Club policies are on the club's Team App, under the Documents tab. Questions, concerns or feedback: Ozzi (Technical Director), td@humecityfc.com."
      }
    ];
    var summerTasks = [
      { id: "tk-01", setId: "ts-summer", title: "Leap frog and burpee", category: "fitness", frequency: "At least twice a week", target: "3 x 2 mins, 1 min break between sets", dueDate: "2025-01-27", url: "https://youtu.be/fINlej2n0js", description: "Complete the leap frog and burpee set from the linked session." },
      { id: "tk-02", setId: "ts-summer", title: "Elbow plank to push-up", category: "fitness", frequency: "At least twice a week", target: "3 x 1 min, 30 sec break between sets", dueDate: "2025-01-27", url: "https://youtube.com/shorts/LHFYQJZkQPE", description: "Complete the elbow plank to push-up set from the linked session." },
      { id: "tk-03", setId: "ts-summer", title: "Sprints", category: "fitness", frequency: "At least twice a week", target: "10m up, 10m back, 20m up, non-stop for 1 min x 5, 30 sec break between reps", dueDate: "2025-01-27", url: "https://youtube.com/shorts/FgqVED7hi5k", description: "Complete the sprint set from the linked session." },
      { id: "tk-04", setId: "ts-summer", title: "Walking lunges", category: "fitness", frequency: "At least twice a week", target: "Non-stop for 2 mins x 3, 30 sec break between sets", dueDate: "2025-01-27", url: "https://youtu.be/MxfTNXSFiYI", description: "Complete the walking lunge set from the linked session." },
      { id: "tk-05", setId: "ts-summer", title: "Wall kicks, both feet", category: "skills", frequency: "At least twice a week", target: "100 x left foot and 100 x right foot against a wall", dueDate: "2025-01-27", url: "", description: "Kick the ball against a wall 100 times with each foot." },
      { id: "tk-06", setId: "ts-summer", title: "Improve your weaker foot", category: "skills", frequency: "At least twice a week", target: "Work through the linked session", dueDate: "2025-01-27", url: "https://www.youtube.com/watch?v=Ql5Jkxruu7U", description: "Use the linked session to practise with the weaker foot." },
      { id: "tk-07", setId: "ts-summer", title: "Kick the ball into the air", category: "skills", frequency: "At least twice a week", target: "Work through the linked session", dueDate: "2025-01-27", url: "https://www.youtube.com/watch?v=4YXM_FX-ioE", description: "Use the linked session to improve kicking the ball into the air." },
      { id: "tk-08", setId: "ts-summer", title: "Ball juggles", category: "skills", frequency: "At least twice a week", target: "5 consecutive juggles", dueDate: "2025-01-27", url: "", description: "Complete 5 consecutive ball juggles." },
      { id: "tk-09", setId: "ts-summer", title: "Passes to a cone", category: "skills", frequency: "At least twice a week", target: "10 consecutive passes to hit a cone 20m away", dueDate: "2025-01-27", url: "", description: "Hit a cone 20 metres away with 10 consecutive passes." },
      { id: "tk-10", setId: "ts-summer", title: "When is a corner awarded?", category: "knowledge", frequency: "Complete before training resumes", target: "Watch the clip and be able to explain it", dueDate: "2025-01-27", url: "https://www.youtube.com/watch?v=4RbhSYw8xF8", description: "Learn when a corner is awarded." },
      { id: "tk-11", setId: "ts-summer", title: "When is a goal kick awarded?", category: "knowledge", frequency: "Complete before training resumes", target: "Watch the clip and be able to explain it", dueDate: "2025-01-27", url: "https://www.youtube.com/watch?v=CWLJ1J5HdZY", description: "Learn when a goal kick is awarded." },
      { id: "tk-12", setId: "ts-summer", title: "When do we start or restart a game?", category: "knowledge", frequency: "Complete before training resumes", target: "Watch the clip and be able to explain it", dueDate: "2025-01-27", url: "https://www.youtube.com/watch?v=cjVAZskU4Tw", description: "Learn when a game is started or restarted." },
      { id: "tk-13", setId: "ts-summer", title: "What is a throw-in?", category: "knowledge", frequency: "Complete before training resumes", target: "Watch the clip and be able to explain it", dueDate: "2025-01-27", url: "https://www.youtube.com/watch?v=-FnYx3Z63bQ", description: "Learn what a throw-in is." },
      { id: "tk-14", setId: "ts-summer", title: "Goalkeeper session (goalkeepers only)", category: "skills", frequency: "At least twice a week, goalkeepers only", target: "Do only sessions 1 to 12 of the linked set", dueDate: "2025-01-27", url: "https://www.youtube.com/watch?v=pBljF6TDZ5U", description: "Goalkeepers only: complete sessions 1 to 12 of the linked drill set. Later sessions in that video are not allowed in this competition." },
      { id: "tk-15", setId: "ts-summer", title: "Learn your new teammates' names and faces", category: "team", frequency: "Complete before training resumes", target: "Know the names and faces of your new teammates", dueDate: "2025-01-27", url: "", description: "An extra task from the U11 Girls coaching staff: learn the names and faces of your new teammates. Teammate names are not listed in this prototype." }
    ];
    var taskProgress = [];
    // Sample completion only, for a realistic grid. Players 01–08 on Girls U8 - U18.
    var doneMap = {
      "pl-01": ["tk-01","tk-02","tk-03","tk-05","tk-08","tk-10","tk-11","tk-15"],
      "pl-02": ["tk-01","tk-05","tk-15"],
      "pl-03": ["tk-01","tk-02","tk-03","tk-04","tk-05","tk-06","tk-07","tk-08","tk-09","tk-10","tk-11","tk-12","tk-13","tk-15"],
      "pl-04": ["tk-01","tk-02","tk-05","tk-08","tk-10"],
      "pl-05": ["tk-15"],
      "pl-06": ["tk-01","tk-02","tk-03","tk-04","tk-05","tk-06","tk-08","tk-10","tk-11","tk-12","tk-15"],
      "pl-07": ["tk-01","tk-05","tk-08","tk-10","tk-15"],
      "pl-08": []
    };
    Object.keys(doneMap).forEach(function (pid) {
      doneMap[pid].forEach(function (tid) {
        taskProgress.push({ setId: "ts-summer", taskId: tid, playerId: pid, complete: true, completedDate: "2025-01-10" });
      });
    });

    var campaigns = [
      {
        teamId: "t-u12g",
        title: "2026 Season by League Campaign (sample)",
        league: "Sample community U12 Girls league",
        coach: "David Crisp",
        overview: "Placeholder only. The U12 Girls League Campaign tab reads David Crisp’s 2026 campaign diary (invented names) when that data file is present.",
        phases: [
          { name: "Pre-season", dates: "January – early February 2026", focus: "Fitness baseline, friendship, first touch and small-sided habits.", sessions: "Two midweek trainings. Fun 3v3 and 4v4, ball mastery, and a simple fitness check (sprint and beep) to open the year.", notes: "SAMPLE: Keep it joyful. Meet families and explain the food / ref / POTM roster." },
          { name: "Opening rounds", dates: "February – April 2026", focus: "Game understanding, width, and being brave on the ball in a 9-a-side shape.", sessions: "One midweek training plus Saturday matches. Repeating patterns: receive, turn, play forward.", notes: "SAMPLE: Early results matter less than habits. Review one clip or one moment with the group each week." },
          { name: "Mid-season block", dates: "May – July 2026", focus: "Pressing together, finishing, and set pieces.", sessions: "Training built around the next opponent. Short finishing practices and a mid-season re-test.", notes: "SAMPLE: Use Player of the Match notes to spot who is leading, not only who is scoring." },
          { name: "Closing / finals campaign", dates: "August – September 2026", focus: "Game management, confidence, and enjoying the end of the year.", sessions: "Sharper walk-throughs, set pieces, and recovery. Keep minutes fair across the squad.", notes: "SAMPLE: End the campaign with a parent thank-you and a simple POTM recap for the season." }
        ]
      }
    ];

    // Sample Food / Ref / POTM / parent-role roster for Dave's U12 Girls.
    // Structure is taken from the shared file title, not from the live sheet cells.
    var u12RoleMatches = [
      { week: "2026-02-07", opponent: "Sample United", homeAway: "Home", venue: "Sample Ground 1" },
      { week: "2026-02-21", opponent: "Example Athletic", homeAway: "Away", venue: "Sample Ground 2" },
      { week: "2026-03-07", opponent: "Placeholder Rovers", homeAway: "Home", venue: "Sample Ground 1" },
      { week: "2026-03-21", opponent: "Sample City", homeAway: "Away", venue: "Sample Ground 3" },
      { week: "2026-04-18", opponent: "Northside Sample", homeAway: "Home", venue: "Sample Ground 1" },
      { week: "2026-05-09", opponent: "Valley Exemplar", homeAway: "Away", venue: "Sample Ground 4" },
      { week: "2026-05-23", opponent: "Creek Placeholders", homeAway: "Home", venue: "Sample Ground 1" },
      { week: "2026-06-06", opponent: "Demo Rangers", homeAway: "Away", venue: "Sample Ground 5" },
      { week: "2026-06-20", opponent: "Sample United", homeAway: "Home", venue: "Sample Ground 1" },
      { week: "2026-07-18", opponent: "Example Athletic", homeAway: "Away", venue: "Sample Ground 2" },
      { week: "2026-08-08", opponent: "Placeholder Rovers", homeAway: "Home", venue: "Sample Ground 1" }
    ];
    var duties = u12RoleMatches.map(function (row, i) {
      var p = function (off) { return "pl-" + String(37 + ((i + off) % 14)).padStart(2, "0"); };
      return {
        teamId: "t-u12g",
        week: row.week,
        opponent: row.opponent,
        homeAway: row.homeAway,
        venue: row.venue,
        captainId: p(0),
        fruitId: p(1),
        foodId: p(1),
        refId: p(7),
        potmId: p(3),
        notes: i % 3 === 0 ? "SAMPLE: fruit cut into quarters, arrive 30 min early." : ""
      };
    });
    var teamCaptains = { "t-u12g": { captainId: "pl-37", viceId: "pl-39" } };
    var potmMonths = [
      { teamId: "t-u12g", month: "2026-02", playerId: "pl-39", note: "SAMPLE: Consistently involved in both boxes." },
      { teamId: "t-u12g", month: "2026-03", playerId: "pl-41", note: "SAMPLE: Two-goal game and tidy defending." },
      { teamId: "t-u12g", month: "2026-04", playerId: "pl-37", note: "SAMPLE: Led the press and helped younger teammates." },
      { teamId: "t-u12g", month: "2026-05", playerId: "pl-43", note: "SAMPLE: Strong finishing and fair play." }
    ];

    return applyDaveU12({
      version: 4,
      currentTeamId: "t-girls",
      teams: t,
      players: players,
      sessions: sessions,
      attendance: attendance,
      currentCoachId: "coach-ozzi",
      periods: periods,
      metrics: metrics,
      assessments: assessments,
      tests: tests,
      testResults: testResults,
      reportCards: reportCards,
      medical: medical,
      matches: matches,
      matchStats: matchStats,
      fixtures: fixtures,
      sessionPlans: sessionPlans,
      equipment: equipment,
      developmentNotes: developmentNotes,
      comms: comms,
      campaigns: campaigns,
      duties: duties,
      teamCaptains: teamCaptains,
      potmMonths: potmMonths,
      taskSets: taskSets,
      tasks: summerTasks,
      taskProgress: taskProgress,
      settings: {
        uniformSizes: ["YS", "YM", "YL", "XS", "S", "M", "L", "XL"],
        technicalDirector: { name: "Ozzi", role: "Technical Director", email: "td@humecityfc.com" },
        policiesNote: "Club policies are on the club's Team App, under the Documents tab.",
        coaches: defaultCoaches(),
        driblFixtureMap: {
          date: "Event Date",
          time: "Event Time",
          round: "Round",
          homeTeam: "Home",
          awayTeam: "Away",
          venue: "Venue",
          field: "Field",
          competition: "Competition",
          ageGroup: "Age Group"
        }
      }
    });
  }


  function applyDaveU12(data) {
    var dave = (typeof window !== "undefined" && window.HCFC_DAVE_U12) ? window.HCFC_DAVE_U12 : null;
    if (!dave || !data) return data;
    data.players = (data.players || []).filter(function (p) { return p.teamId !== "t-u12g"; }).concat(dave.players || []);
    data.sessions = (data.sessions || []).filter(function (x) { return x.teamId !== "t-u12g"; }).concat(dave.storeSessions || []);
    data.matches = (data.matches || []).filter(function (x) { return x.teamId !== "t-u12g"; }).concat(dave.storeMatches || []);
    data.fixtures = (data.fixtures || []).filter(function (x) { return x.teamId !== "t-u12g"; }).concat(dave.storeFixtures || []);
    data.attendance = (data.attendance || []).filter(function (a) { return String(a.sessionId || "").indexOf("s-u12-") !== 0; });
    var sessByDate = {};
    (dave.storeSessions || []).forEach(function (sess) {
      if (sess.type === "Training") sessByDate[sess.date] = sess.id;
    });
    (dave.training || []).forEach(function (row) {
      (row.marks || []).forEach(function (m) {
        var sid = sessByDate[m.date];
        if (!sid) return;
        data.attendance.push({ sessionId: sid, playerId: row.playerId, present: m.code === "Y", code: m.code });
      });
    });
    data.matchStats = (data.matchStats || []).filter(function (st) {
      return String(st.matchId || "").indexOf("m-u12-") !== 0;
    });
    return data;
  }

  function load() {
    try {
      var raw = storeGet(KEY);
      if (!raw) {
        var fresh = seed();
        save(fresh);
        return fresh;
      }
      var data = JSON.parse(raw);
      if (!data.teams || !data.players) throw new Error("empty");
      if (!data.fixtures) data.fixtures = seed().fixtures;
      if (!data.settings) data.settings = seed().settings;
      if (!data.settings.technicalDirector) data.settings.technicalDirector = seed().settings.technicalDirector;
      if (data.settings.technicalDirector && data.settings.technicalDirector.name === "Ozzy") data.settings.technicalDirector.name = "Ozzi";
      if (!data.settings.policiesNote) data.settings.policiesNote = seed().settings.policiesNote;
      if (!data.settings.coaches) data.settings.coaches = seed().settings.coaches;
      if (data.taskSets) data.taskSets.forEach(function (s) { if (s.notes) s.notes = String(s.notes).replace(/Ozzy/g, "Ozzi"); });
      if (!data.taskSets) {
        var seeded = seed();
        data.taskSets = seeded.taskSets;
        data.tasks = seeded.tasks;
        data.taskProgress = seeded.taskProgress;
      }
      if (!data.tasks) data.tasks = [];
      if (!data.taskProgress) data.taskProgress = [];
      var seeded = seed();
      var have = {};
      (data.teams || []).forEach(function (t) { have[t.id] = true; });
      seeded.teams.forEach(function (t) { if (!have[t.id]) data.teams.push(t); });
      var haveP = {};
      (data.players || []).forEach(function (pl) { haveP[pl.id] = true; });
      seeded.players.forEach(function (pl) { if (!haveP[pl.id]) data.players.push(pl); });
      var haveS = {};
      (data.sessions || []).forEach(function (x) { haveS[x.id] = true; });
      seeded.sessions.forEach(function (x) { if (!haveS[x.id]) data.sessions.push(x); });
      var haveA = {};
      (data.attendance || []).forEach(function (a) { haveA[a.sessionId + ":" + a.playerId] = true; });
      seeded.attendance.forEach(function (a) { if (!haveA[a.sessionId + ":" + a.playerId]) data.attendance.push(a); });
      var havePer = {};
      (data.periods || []).forEach(function (per) { havePer[per.id] = true; });
      seeded.periods.forEach(function (per) { if (!havePer[per.id]) data.periods.push(per); });
      data.periods.sort(function (a, b) { return String(a.start).localeCompare(String(b.start)); });
      if (!data.settings.coaches || !data.settings.coaches.length) data.settings.coaches = defaultCoaches();
      else {
        var byId = {};
        data.settings.coaches.forEach(function (c) { byId[c.id] = c; });
        defaultCoaches().forEach(function (c) {
          if (!byId[c.id]) data.settings.coaches.push(c);
          else {
            if (!byId[c.id].teamId && c.teamId) byId[c.id].teamId = c.teamId;
            if (byId[c.id].canViewAll == null) byId[c.id].canViewAll = !!c.canViewAll;
          }
        });
      }
      if (!data.currentCoachId) data.currentCoachId = "coach-ozzi";
      if (!data.tests || !data.tests.length) data.tests = defaultTests();
      if (!data.testResults) data.testResults = [];
      if (!data.reportCards) data.reportCards = [];
      if (!data.testResults.length && seeded.testResults) data.testResults = seeded.testResults;
      if (!data.reportCards.length && seeded.reportCards) data.reportCards = seeded.reportCards;
      if (!data.campaigns) data.campaigns = seeded.campaigns || [];
      if (!data.duties) data.duties = seeded.duties || [];
      if (!data.teamCaptains) data.teamCaptains = seeded.teamCaptains || {};
      if (!data.potmMonths) data.potmMonths = seeded.potmMonths || [];
      return data;
    } catch (e) {
      var fallback = seed();
      save(fallback);
      return fallback;
    }
  }

  function u12Ids(data) {
    var ids = {};
    (data.players || []).forEach(function (p) { if (p.teamId === "t-u12g") ids[p.id] = true; });
    return ids;
  }
  function stripDaveU12(data) {
    if (!data) return data;
    var ids = u12Ids(data);
    function keepP(p) { return p.teamId !== "t-u12g"; }
    function keepT(x) { return x && x.teamId !== "t-u12g"; }
    function keepId(x, key) { return x && !ids[x[key]]; }
    var copy = {};
    Object.keys(data).forEach(function (k) { copy[k] = data[k]; });
    copy.players = (data.players || []).filter(keepP);
    copy.sessions = (data.sessions || []).filter(keepT);
    copy.matches = (data.matches || []).filter(keepT);
    copy.fixtures = (data.fixtures || []).filter(keepT);
    copy.attendance = (data.attendance || []).filter(function (a) {
      return String(a.sessionId || "").indexOf("s-u12-") !== 0 && !ids[a.playerId];
    });
    copy.matchStats = (data.matchStats || []).filter(function (st) {
      return String(st.matchId || "").indexOf("m-u12-") !== 0 && !ids[st.playerId];
    });
    copy.duties = (data.duties || []).filter(keepT);
    copy.campaigns = (data.campaigns || []).filter(keepT);
    copy.medical = (data.medical || []).filter(function (m) { return !ids[m.playerId]; });
    copy.developmentNotes = (data.developmentNotes || []).filter(function (m) { return !ids[m.playerId]; });
    copy.comms = (data.comms || []).filter(function (m) { return !ids[m.playerId]; });
    copy.equipment = (data.equipment || []).filter(keepT);
    copy.sessionPlans = (data.sessionPlans || []).filter(keepT);
    if (copy.teamCaptains) {
      var tc = {};
      Object.keys(copy.teamCaptains).forEach(function (k) { if (k !== "t-u12g") tc[k] = copy.teamCaptains[k]; });
      copy.teamCaptains = tc;
    }
    copy.potmMonths = (data.potmMonths || []).filter(keepT);
    return copy;
  }
  function save(data) {
    storeSet(KEY, JSON.stringify(stripDaveU12(data)));
    return data;
  }

  function resetSample() {
    var data = seed();
    save(data);
    return data;
  }

  function clearAll() {
    var empty = {
      version: 4,
      currentTeamId: "t-girls",
      teams: teams(),
      players: [],
      sessions: [],
      attendance: [],
      currentCoachId: "coach-ozzi",
      periods: defaultPeriods(),
      metrics: defaultMetrics(),
      assessments: [],
      tests: defaultTests(),
      testResults: [],
      reportCards: [],
      medical: [],
      matches: [],
      matchStats: [],
      fixtures: [],
      sessionPlans: [],
      equipment: [],
      developmentNotes: [],
      comms: [],
      campaigns: [],
      duties: [],
      teamCaptains: {},
      potmMonths: [],
      taskSets: [],
      tasks: [],
      taskProgress: [],
      settings: seed().settings
    };
    save(empty);
    return empty;
  }

  global.HCFC = {
    KEY: KEY,
    storageAvailable: function () { return storageAvailable; },
    uid: uid,
    load: load,
    save: save,
    seed: seed,
    resetSample: resetSample,
    clearAll: clearAll,
    applyDaveU12: applyDaveU12,
    stripDaveU12: stripDaveU12,
    defaultPeriods: defaultPeriods,
    defaultMetrics: defaultMetrics,
    defaultTests: defaultTests,
    defaultCoaches: defaultCoaches
  };
})(window);
