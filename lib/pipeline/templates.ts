export interface ConceptTemplate {
  name: string;
  aliases: string[];
  domain:
    | "VLA"
    | "World Model"
    | "RL Post-training"
    | "Robotics"
    | "Embodied Intelligence"
    | "General ML";
  difficulty: "basic" | "intermediate" | "advanced" | "research-level";
  shortDefinition: string;
  deepExplanation: string;
  whyItMatters: string;
  minimalExample: string;
  mathNotes?: string;
  commonConfusions: string[];
  interviewQuestions: string[];
}

export const CONCEPT_LIBRARY: ConceptTemplate[] = [
  {
    name: "Action Chunking",
    aliases: ["chunked action prediction", "temporal action chunk"],
    domain: "VLA",
    difficulty: "intermediate",
    shortDefinition:
      "Predict a short horizon of actions at once instead of one-step action for every control tick.",
    deepExplanation:
      "Action Chunking reduces compounding error by predicting coherent short trajectories, then executing in receding horizon. It improves smoothness and stabilizes long-horizon manipulation when perception is noisy.",
    whyItMatters:
      "It is a core design choice behind modern diffusion-based robot policies and a frequent interview topic.",
    minimalExample:
      "Given image+state at time t, output 8 delta end-effector commands and execute first 2 before replanning.",
    mathNotes: "Optimize p(a_{t:t+H}|o_t, instruction) with trajectory-level objective.",
    commonConfusions: [
      "Confusing chunk length with control frequency",
      "Assuming chunking means open-loop rollout without replanning"
    ],
    interviewQuestions: [
      "Why can Action Chunking outperform autoregressive one-step control?",
      "How do you choose chunk horizon under latency constraints?"
    ]
  },
  {
    name: "Diffusion Policy",
    aliases: ["denoising policy", "score-based policy"],
    domain: "VLA",
    difficulty: "advanced",
    shortDefinition:
      "A policy that denoises action trajectories from Gaussian noise conditioned on observations.",
    deepExplanation:
      "Diffusion Policy learns a trajectory distribution with iterative denoising, capturing multimodality in human demonstrations. In robotics it often predicts action chunks and uses receding-horizon execution.",
    whyItMatters:
      "Strong baseline for manipulation and behavior cloning in high-dimensional action spaces.",
    minimalExample:
      "Train epsilon-theta to denoise noisy 10-step action sequence conditioned on wrist-camera image and proprioception.",
    mathNotes: "Minimize E[||epsilon - epsilon_theta(x_t, cond, t)||^2].",
    commonConfusions: [
      "Treating diffusion steps as environment timesteps",
      "Ignoring inference latency tradeoffs"
    ],
    interviewQuestions: [
      "What does diffusion buy compared with Gaussian policy heads?",
      "How do you reduce sampling latency for real robot control?"
    ]
  },
  {
    name: "World Model",
    aliases: ["latent dynamics model"],
    domain: "World Model",
    difficulty: "advanced",
    shortDefinition: "A learned model of environment dynamics used for planning or policy learning.",
    deepExplanation:
      "World Models learn transitions in latent space, often with reconstruction and predictive objectives. They enable imagination rollouts, uncertainty-aware planning, and data-efficient policy improvement.",
    whyItMatters:
      "Central to long-horizon reasoning, control, and sample-efficient embodied intelligence.",
    minimalExample:
      "Learn z_{t+1}=f(z_t, a_t) and plan actions by model predictive control in latent space.",
    commonConfusions: [
      "Assuming high reconstruction quality implies planning quality",
      "Ignoring model bias accumulation"
    ],
    interviewQuestions: [
      "How do you evaluate a World Model for control usefulness rather than pixel PSNR?"
    ]
  },
  {
    name: "World Action Model",
    aliases: ["action-conditioned world foundation"],
    domain: "World Model",
    difficulty: "research-level",
    shortDefinition:
      "A world model focusing on action-conditional representation for embodied decision making.",
    deepExplanation:
      "World Action Models bridge perception and control by grounding latent dynamics in executable action abstractions. They can power simulation, planning, and policy distillation across tasks.",
    whyItMatters:
      "Likely direction for scalable embodied foundation agents and cross-robot transfer.",
    minimalExample:
      "Train transformer latent dynamics on multimodal trajectories and query rollouts for candidate action plans.",
    commonConfusions: [
      "Confusing language world model with robot action world model",
      "Skipping alignment between latent actions and low-level controllers"
    ],
    interviewQuestions: [
      "How does a World Action Model differ from a pure predictive World Model?"
    ]
  },
  {
    name: "GRPO",
    aliases: ["Group Relative Policy Optimization"],
    domain: "RL Post-training",
    difficulty: "advanced",
    shortDefinition:
      "A post-training RL method using group-relative comparisons to update reasoning policies.",
    deepExplanation:
      "GRPO compares candidate outputs within groups using relative reward and can reduce dependence on a learned critic. It is useful in reasoning LLM post-training where ranking signals are available.",
    whyItMatters:
      "Frequently asked in reasoning LLM interviews and increasingly used in open implementations.",
    minimalExample:
      "Sample k completions per prompt, rank with verifier, and optimize policy preference toward higher-ranked trajectories.",
    commonConfusions: [
      "Thinking GRPO removes the need for careful reward modeling",
      "Treating rank-based preference as unbiased ground truth"
    ],
    interviewQuestions: [
      "When would you prefer GRPO over PPO for reasoning tasks?"
    ]
  },
  {
    name: "PPO",
    aliases: ["Proximal Policy Optimization"],
    domain: "RL Post-training",
    difficulty: "intermediate",
    shortDefinition:
      "Policy-gradient optimization with clipped objective to stabilize updates.",
    deepExplanation:
      "PPO bounds policy shift per update via clipping or KL penalties, balancing improvement and stability. In LLM post-training it is often paired with reward models and KL control to base policy.",
    whyItMatters:
      "Classic and still foundational for understanding modern RLHF variants.",
    minimalExample:
      "Optimize E[min(r_t A_t, clip(r_t,1-eps,1+eps)A_t)] over sampled trajectories.",
    commonConfusions: [
      "Ignoring reward normalization",
      "Overlooking KL collapse in long runs"
    ],
    interviewQuestions: [
      "Why does PPO clipping improve stability versus vanilla policy gradient?"
    ]
  },
  {
    name: "DPO",
    aliases: ["Direct Preference Optimization"],
    domain: "RL Post-training",
    difficulty: "advanced",
    shortDefinition: "A preference optimization objective without explicit RL rollouts.",
    deepExplanation:
      "DPO reframes preference learning into supervised-style optimization over chosen/rejected pairs relative to a reference model. It can be simpler than PPO pipelines while retaining alignment gains.",
    whyItMatters:
      "Common baseline in alignment systems and useful comparison point in interviews.",
    minimalExample:
      "Train policy with logistic loss on (chosen, rejected) pair log-prob differences.",
    commonConfusions: [
      "Assuming DPO always outperforms PPO",
      "Ignoring sensitivity to preference dataset quality"
    ],
    interviewQuestions: ["What assumptions allow DPO to avoid explicit reward modeling?"]
  },
  {
    name: "Process Reward Model",
    aliases: ["PRM"],
    domain: "RL Post-training",
    difficulty: "research-level",
    shortDefinition:
      "A reward model that scores intermediate reasoning steps rather than only final answers.",
    deepExplanation:
      "PRMs provide dense supervision on reasoning trajectories and can improve credit assignment. They are crucial when final-answer-only rewards are sparse or easy to hack.",
    whyItMatters:
      "Major research direction for robust reasoning post-training and verifier-aware systems.",
    minimalExample:
      "Assign per-step rewards for math proof chain validity and optimize policy to maximize cumulative process score.",
    commonConfusions: [
      "Confusing PRM with token-level likelihood",
      "Ignoring annotation consistency for step labels"
    ],
    interviewQuestions: [
      "How do PRMs mitigate reward hacking compared with outcome-only rewards?"
    ]
  },
  {
    name: "Outcome Reward Model",
    aliases: ["ORM"],
    domain: "RL Post-training",
    difficulty: "intermediate",
    shortDefinition: "A reward model that scores final response quality.",
    deepExplanation:
      "ORMs predict scalar quality from completed outputs and are easy to scale, but can miss flawed reasoning with correct-looking answers.",
    whyItMatters: "Baseline reward source and common contrast with PRM in interviews.",
    minimalExample:
      "Score final completion correctness and helpfulness to train policy via PPO.",
    commonConfusions: ["Treating high ORM score as proof of sound reasoning"],
    interviewQuestions: ["What failure modes emerge when relying only on ORM?"]
  },
  {
    name: "Verifier Model",
    aliases: ["judge model", "critic verifier"],
    domain: "RL Post-training",
    difficulty: "advanced",
    shortDefinition:
      "A model that evaluates candidate outputs for correctness, faithfulness, or policy constraints.",
    deepExplanation:
      "Verifiers provide scalable supervision via ranking, filtering, or reward shaping. In reasoning and embodied settings they can enforce format, factual, or safety constraints.",
    whyItMatters:
      "Verifier quality often bottlenecks post-training effectiveness and interview performance.",
    minimalExample:
      "Use verifier to score reasoning traces, keep top candidates for GRPO update.",
    commonConfusions: [
      "Assuming verifier is unbiased",
      "Ignoring verifier overfitting to benchmark artifacts"
    ],
    interviewQuestions: ["How do you audit a verifier model before deployment?"]
  }
];

export const PIPELINE_KEYWORDS = [
  "vision language action",
  "vla",
  "world model",
  "world action model",
  "diffusion policy",
  "action chunking",
  "grpo",
  "ppo",
  "dpo",
  "process reward model",
  "outcome reward model",
  "verifier model",
  "embodied intelligence"
] as const;
