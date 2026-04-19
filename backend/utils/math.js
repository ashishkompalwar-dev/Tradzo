function roundTo(value, digits = 2) {
  return Number(Number(value).toFixed(digits));
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function monthlyRate(annualRatePercent) {
  return safeNumber(annualRatePercent) / 12 / 100;
}

function annualRate(annualRatePercent) {
  return safeNumber(annualRatePercent) / 100;
}

function futureValueLumpsum(principal, annualRatePercent, years) {
  const p = safeNumber(principal);
  const r = annualRate(annualRatePercent);
  const t = safeNumber(years);
  return p * Math.pow(1 + r, t);
}

function futureValueSIP(monthlyInvestment, annualRatePercent, years) {
  const pmt = safeNumber(monthlyInvestment);
  const r = monthlyRate(annualRatePercent);
  const n = Math.max(0, Math.round(safeNumber(years) * 12));

  if (n === 0) return 0;
  if (r === 0) return pmt * n;

  return pmt * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

function loanEMI(principal, annualRatePercent, years, months) {
  const p = safeNumber(principal);
  const r = monthlyRate(annualRatePercent);
  const n = months ? Math.max(1, Math.round(safeNumber(months))) : Math.max(1, Math.round(safeNumber(years) * 12));

  if (r === 0) {
    const emiZeroRate = p / n;
    return {
      monthlyEmi: emiZeroRate,
      totalAmount: emiZeroRate * n,
      totalInterest: 0,
      months: n,
    };
  }

  const numerator = p * r * Math.pow(1 + r, n);
  const denominator = Math.pow(1 + r, n) - 1;
  const emi = denominator === 0 ? 0 : numerator / denominator;
  const totalAmount = emi * n;
  const totalInterest = totalAmount - p;

  return {
    monthlyEmi: emi,
    totalAmount,
    totalInterest,
    months: n,
  };
}

function compoundInterest(principal, annualRatePercent, years, compoundsPerYear = 1) {
  const p = safeNumber(principal);
  const r = annualRate(annualRatePercent);
  const t = safeNumber(years);
  const m = Math.max(1, Math.round(safeNumber(compoundsPerYear, 1)));
  const amount = p * Math.pow(1 + r / m, m * t);

  return {
    finalAmount: amount,
    totalInterest: amount - p,
  };
}

function monthlyInvestmentProjection(monthlyInvestment, annualRatePercent, months) {
  const pmt = safeNumber(monthlyInvestment);
  const r = monthlyRate(annualRatePercent);
  const totalMonths = Math.max(0, Math.round(safeNumber(months)));

  const schedule = [];
  let corpus = 0;

  for (let i = 1; i <= totalMonths; i += 1) {
    const opening = corpus;
    corpus += pmt;
    const interest = corpus * r;
    corpus += interest;

    schedule.push({
      month: i,
      opening: roundTo(opening),
      contribution: roundTo(pmt),
      interest: roundTo(interest),
      closing: roundTo(corpus),
    });
  }

  const totalInvested = pmt * totalMonths;
  return {
    totalMonths,
    totalInvested,
    maturityAmount: corpus,
    totalReturns: corpus - totalInvested,
    schedule,
  };
}

function retirementPlan({
  currentAge,
  retirementAge,
  lifeExpectancy,
  monthlyExpenseToday,
  inflationRate,
  preRetirementReturn,
  postRetirementReturn,
}) {
  const ageNow = safeNumber(currentAge);
  const ageRet = safeNumber(retirementAge);
  const ageLife = safeNumber(lifeExpectancy);
  const monthlyExpense = safeNumber(monthlyExpenseToday);
  const inflation = annualRate(inflationRate);
  const preRet = annualRate(preRetirementReturn);
  const postRet = annualRate(postRetirementReturn);

  const yearsToRetirement = Math.max(0, ageRet - ageNow);
  const retirementYears = Math.max(0, ageLife - ageRet);

  const monthlyExpenseAtRetirement = monthlyExpense * Math.pow(1 + inflation, yearsToRetirement);
  const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12;

  let requiredCorpus;
  if (retirementYears === 0) {
    requiredCorpus = annualExpenseAtRetirement;
  } else if (Math.abs(postRet - inflation) < 1e-9) {
    requiredCorpus = (annualExpenseAtRetirement * retirementYears) / (1 + postRet);
  } else {
    requiredCorpus =
      (annualExpenseAtRetirement / (postRet - inflation)) *
      (1 - Math.pow((1 + inflation) / (1 + postRet), retirementYears));
  }

  const monthsToRetirement = Math.max(1, Math.round(yearsToRetirement * 12));
  const monthlyPreRate = preRet / 12;

  let requiredMonthlyInvestment;
  if (monthlyPreRate === 0) {
    requiredMonthlyInvestment = requiredCorpus / monthsToRetirement;
  } else {
    requiredMonthlyInvestment =
      (requiredCorpus * monthlyPreRate) /
      (Math.pow(1 + monthlyPreRate, monthsToRetirement) - 1);
  }

  return {
    yearsToRetirement,
    retirementYears,
    monthlyExpenseAtRetirement,
    requiredCorpus,
    requiredMonthlyInvestment,
  };
}

function swpPlan(initialCorpus, monthlyWithdrawal, annualRatePercent, months) {
  let corpus = safeNumber(initialCorpus);
  const withdrawal = safeNumber(monthlyWithdrawal);
  const r = monthlyRate(annualRatePercent);
  const maxMonths = Math.max(1, Math.round(safeNumber(months, 360)));

  const schedule = [];
  let monthsSustained = 0;

  for (let i = 1; i <= maxMonths; i += 1) {
    if (corpus <= 0) break;

    const opening = corpus;
    const growth = corpus * r;
    const beforeWithdrawal = corpus + growth;
    const actualWithdrawal = Math.min(withdrawal, beforeWithdrawal);
    corpus = beforeWithdrawal - actualWithdrawal;

    schedule.push({
      month: i,
      opening: roundTo(opening),
      growth: roundTo(growth),
      withdrawal: roundTo(actualWithdrawal),
      closing: roundTo(corpus),
    });

    monthsSustained = i;
    if (corpus <= 0) break;
  }

  return {
    monthsSustained,
    endingCorpus: Math.max(0, corpus),
    depleted: corpus <= 0,
    schedule,
  };
}

module.exports = {
  roundTo,
  safeNumber,
  futureValueLumpsum,
  futureValueSIP,
  loanEMI,
  compoundInterest,
  monthlyInvestmentProjection,
  retirementPlan,
  swpPlan,
};
