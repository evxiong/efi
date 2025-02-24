"""
Functions for evaluating model performance.
"""

import math


def compute_rps(probs: list[float], outcome: list[int]) -> float:
    """Computes ranked probability score for a single match.

    Args:
        probs (list[float]): projected match probabilities: [prob_1, prob_d,
            prob_2]
        outcome (list[int]): one-hot representation of actual match result:
            [1,0,0] -> home win, [0,1,0] -> draw, [0,0,1] -> away win

    Returns:
        float: ranked probability score (range: 0 to 1)
    """
    sum_rps = 0
    for i in range(len(outcome)):
        sum = 0
        for j in range(i + 1):
            sum += probs[j] - outcome[j]
        sum_rps += sum**2.0
    return sum_rps / (len(outcome) - 1)


def compute_ign(probs: list[float], outcome: list[int]) -> float:
    """Computes ignorance score for a single match.

    Args:
        probs (list[float]): projected match probabilities: [prob_1, prob_d,
            prob_2]
        outcome (list[int]): one-hot representation of actual match result:
            [1,0,0] -> home win, [0,1,0] -> draw, [0,0,1] -> away win

    Returns:
        float: ignorance score (range: 0 to infinity)
    """
    return -math.log2(probs[outcome.index(1)])


def compute_bs(probs: list[float], outcome: list[int]) -> float:
    """Computes Brier score for a single match.

    Args:
        probs (list[float]): projected match probabilities: [prob_1, prob_d,
            prob_2]
        outcome (list[int]): one-hot representation of actual match result:
            [1,0,0] -> home win, [0,1,0] -> draw, [0,0,1] -> away win

    Returns:
        float: Brier score (range: 0 to 2)
    """
    sum_bs = 0
    for i in range(len(outcome)):
        sum_bs += (probs[i] - outcome[i]) ** 2.0
    return sum_bs
