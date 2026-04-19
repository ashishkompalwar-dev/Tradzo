const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  roundTo,
  futureValueLumpsum,
  futureValueSIP,
  loanEMI,
  compoundInterest,
  monthlyInvestmentProjection,
  retirementPlan,
  swpPlan,
} = require('../utils/math');

const router = express.Router();

function validationFailed(req, res) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  return true;
}

router.post(
  '/emi',
  [
    body('principal').isFloat({ gt: 0 }).withMessage('Principal must be greater than 0'),
    body('annualRate').isFloat({ min: 0 }).withMessage('Annual rate must be >= 0'),
    body('years').optional().isFloat({ gt: 0 }),
    body('months').optional().isInt({ gt: 0 }),
  ],
  (req, res) => {
    if (validationFailed(req, res)) return;

    const { principal, annualRate, years, months } = req.body;
    const calc = loanEMI(principal, annualRate, years, months);

    return res.json({
      type: 'emi',
      input: { principal: Number(principal), annualRate: Number(annualRate), years, months },
      output: {
        months: calc.months,
        monthlyEmi: roundTo(calc.monthlyEmi),
        totalInterest: roundTo(calc.totalInterest),
        totalAmount: roundTo(calc.totalAmount),
      },
    });
  },
);

router.post('/loan-emi', [body('principal').isFloat({ gt: 0 }), body('annualRate').isFloat({ min: 0 }), body('years').optional().isFloat({ gt: 0 }), body('months').optional().isInt({ gt: 0 })], (req, res) => {
  if (validationFailed(req, res)) return;
  const { principal, annualRate, years, months } = req.body;
  const calc = loanEMI(principal, annualRate, years, months);
  return res.json({
    type: 'loan-emi',
    output: {
      months: calc.months,
      monthlyEmi: roundTo(calc.monthlyEmi),
      totalInterest: roundTo(calc.totalInterest),
      totalAmount: roundTo(calc.totalAmount),
    },
  });
});

router.post(
  '/sip',
  [
    body('monthlyInvestment').isFloat({ gt: 0 }).withMessage('Monthly investment must be > 0'),
    body('annualRate').isFloat({ min: 0 }).withMessage('Annual rate must be >= 0'),
    body('years').isFloat({ gt: 0 }).withMessage('Years must be > 0'),
  ],
  (req, res) => {
    if (validationFailed(req, res)) return;

    const monthlyInvestment = Number(req.body.monthlyInvestment);
    const annualRate = Number(req.body.annualRate);
    const years = Number(req.body.years);
    const totalInvested = monthlyInvestment * years * 12;
    const maturityAmount = futureValueSIP(monthlyInvestment, annualRate, years);

    return res.json({
      type: 'sip',
      output: {
        totalInvested: roundTo(totalInvested),
        maturityAmount: roundTo(maturityAmount),
        totalReturns: roundTo(maturityAmount - totalInvested),
      },
    });
  },
);

router.post(
  '/monthly-returns',
  [
    body('monthlyInvestment').isFloat({ gt: 0 }).withMessage('Monthly investment must be > 0'),
    body('annualRate').isFloat({ min: 0 }).withMessage('Annual rate must be >= 0'),
    body('months').isInt({ gt: 0, lte: 1200 }).withMessage('Months should be 1-1200'),
  ],
  (req, res) => {
    if (validationFailed(req, res)) return;

    const result = monthlyInvestmentProjection(req.body.monthlyInvestment, req.body.annualRate, req.body.months);
    return res.json({
      type: 'monthly-returns',
      output: {
        totalMonths: result.totalMonths,
        totalInvested: roundTo(result.totalInvested),
        maturityAmount: roundTo(result.maturityAmount),
        totalReturns: roundTo(result.totalReturns),
        schedule: result.schedule,
      },
    });
  },
);

router.post(
  '/lumpsum',
  [
    body('principal').isFloat({ gt: 0 }).withMessage('Principal must be > 0'),
    body('annualRate').isFloat({ min: 0 }).withMessage('Annual rate must be >= 0'),
    body('years').isFloat({ gt: 0 }).withMessage('Years must be > 0'),
  ],
  (req, res) => {
    if (validationFailed(req, res)) return;

    const principal = Number(req.body.principal);
    const amount = futureValueLumpsum(principal, req.body.annualRate, req.body.years);

    return res.json({
      type: 'lumpsum',
      output: {
        investedAmount: roundTo(principal),
        maturityAmount: roundTo(amount),
        totalReturns: roundTo(amount - principal),
      },
    });
  },
);

router.post(
  '/compound-interest',
  [
    body('principal').isFloat({ gt: 0 }).withMessage('Principal must be > 0'),
    body('annualRate').isFloat({ min: 0 }).withMessage('Annual rate must be >= 0'),
    body('years').isFloat({ gt: 0 }).withMessage('Years must be > 0'),
    body('compoundsPerYear').optional().isInt({ gt: 0, lte: 365 }),
  ],
  (req, res) => {
    if (validationFailed(req, res)) return;

    const principal = Number(req.body.principal);
    const calc = compoundInterest(
      principal,
      req.body.annualRate,
      req.body.years,
      req.body.compoundsPerYear || 1,
    );

    return res.json({
      type: 'compound-interest',
      output: {
        principal: roundTo(principal),
        finalAmount: roundTo(calc.finalAmount),
        totalInterest: roundTo(calc.totalInterest),
      },
    });
  },
);

router.post(
  '/retirement',
  [
    body('currentAge').isInt({ min: 18, max: 80 }),
    body('retirementAge').isInt({ min: 30, max: 90 }),
    body('lifeExpectancy').isInt({ min: 50, max: 110 }),
    body('monthlyExpenseToday').isFloat({ gt: 0 }),
    body('inflationRate').isFloat({ min: 0, max: 25 }),
    body('preRetirementReturn').isFloat({ min: 0, max: 40 }),
    body('postRetirementReturn').isFloat({ min: 0, max: 25 }),
  ],
  (req, res) => {
    if (validationFailed(req, res)) return;

    if (Number(req.body.retirementAge) <= Number(req.body.currentAge)) {
      return res.status(400).json({ message: 'Retirement age should be greater than current age' });
    }
    if (Number(req.body.lifeExpectancy) <= Number(req.body.retirementAge)) {
      return res.status(400).json({ message: 'Life expectancy should be greater than retirement age' });
    }

    const plan = retirementPlan(req.body);
    return res.json({
      type: 'retirement',
      output: {
        yearsToRetirement: plan.yearsToRetirement,
        retirementYears: plan.retirementYears,
        monthlyExpenseAtRetirement: roundTo(plan.monthlyExpenseAtRetirement),
        requiredCorpus: roundTo(plan.requiredCorpus),
        requiredMonthlyInvestment: roundTo(plan.requiredMonthlyInvestment),
      },
    });
  },
);

router.post(
  '/swp',
  [
    body('initialCorpus').isFloat({ gt: 0 }).withMessage('Initial corpus must be > 0'),
    body('monthlyWithdrawal').isFloat({ gt: 0 }).withMessage('Monthly withdrawal must be > 0'),
    body('annualRate').isFloat({ min: 0 }).withMessage('Annual rate must be >= 0'),
    body('months').optional().isInt({ gt: 0, lte: 1200 }),
  ],
  (req, res) => {
    if (validationFailed(req, res)) return;

    const result = swpPlan(
      req.body.initialCorpus,
      req.body.monthlyWithdrawal,
      req.body.annualRate,
      req.body.months || 360,
    );

    return res.json({
      type: 'swp',
      output: {
        monthsSustained: result.monthsSustained,
        yearsSustained: roundTo(result.monthsSustained / 12),
        endingCorpus: roundTo(result.endingCorpus),
        depleted: result.depleted,
        schedulePreview: result.schedule.slice(0, 120),
      },
    });
  },
);

router.get('/', (req, res) => {
  res.json({
    message: 'Tools API ready',
    calculators: [
      'POST /api/tools/emi',
      'POST /api/tools/loan-emi',
      'POST /api/tools/sip',
      'POST /api/tools/monthly-returns',
      'POST /api/tools/lumpsum',
      'POST /api/tools/compound-interest',
      'POST /api/tools/retirement',
      'POST /api/tools/swp',
    ],
  });
});

module.exports = router;
