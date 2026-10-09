---
layout: default
title: Research Projects
---

# Robotics Research

I've been immensely fortunate to have the academic resources that I have had and most of the projects resulted in publications which I link to below, but some either failed or were explored more out of personal interest -- I include both below. All of the overviews are very brief, contact me if you'd like to hear more!

---

## Proximity & Pressure-Based Manipulation Controller (MS Thesis)

> Unlocking humanoid robotic, prosthetic, and exoskeleton controllers for grasping tasks.

- **Institution**: <a href="https://www.epic.gatech.edu/" target="_blank">EPIC Lab</a>, Georgia Institute of Technology
- **Dates**: April 2024 - April 2025
- **Description**: Using the below project (The Infinity Gauntlet), I perform data collections with 15 individuals and subsequently train deep learning position and torque controllers for prosthetic manipulators.

---

## The Infinity Gauntlet (MS Thesis)

> Enabling anthropomorphic grasping imitation learning.

- **Institution**: <a href="https://www.epic.gatech.edu/" target="_blank">EPIC Lab</a>, Georgia Institute of Technology
- **Dates**: April 2024 - December 2024
- **Description**: Many techniques for manipulators now rely on deep learning methods wherein models learn from examples. Currently, systems are limited to motion tracking and very rudimentary force sensing (these systems cost between $45k and $150k). In order to reduce the barrier to entry and enable imitation learning from human gripping motions (which unlocks prosthetic and exoskeleton applications), I develop a glove sensor suite that contains *25 proximity sensors, 35 pressure sensors, full joint tracking (sub-mm accuracy), and 22-channel EMG sensing* and additional loadcell-instrumented objects. Additionally, I've designed an end-to-end OpenSim pipeline to compute inverse kinematics and joint torque profiles. In sum, the glove allows for complete data collection on how we use our hands when interacting with objects.

---

## Learning Tube Dynamics with Massively Parallel Simulation for Robust Safety in Practice

> "Thou shalt not bump into things."  

- **Institution**: <a href="http://www.bipedalrobotics.com/" target="_blank">AMBER Lab</a>, California Institute of Technology
- **Dates**: April 2024 - August 2024
- **Description**: We used simulations in IsaacSim to collect massive amounts of data on the relation between planning and tracking controllers (i.e. tracking accuracy) in moving robots - demonstrated on quadruped, biped, and hopping robots in simulation. The resulting data was then used to train a neural network. The parameters of this neural network were used in model predictive control (MPC) to plan optimal safety-robust trajectories through environments.
- **Publication**: Submitted to *ICRA 2025*
- **Links**: [Read the paper](https://arxiv.org/abs/2411.15350), [See the code](https://github.com/wdc3iii/legged_gym_dev)


---

## Massively Parallelized Reinforcement Learning for Trajectory-Based Controllers

> 30,000 robots flailing on a screen until they start sprinting around complex paths.

- **Institution**: <a href="http://www.bipedalrobotics.com/" target="_blank">AMBER Lab</a>, California Institute of Technology 
- **Dates**: April 2024 - August 2024
- **Description**: There exist many velocity-based controllers that use simulations to train reinforcement learning models, but none that train trajectory-based controllers. Trajectory-based controllers are much more robust (e.g. no need for extensive PID tuning) both individually and generally as part of a hierarchical pipeline (e.g. MPC planning). Thus, I developed a curriculum training pipeline inside of IsaacSim and demonstrated its efficacy on quadruped, biped, and hopper robots.
- **Links**: [Read a very partial report](https://portfolio.colebjohnson.com/research/presentation.pdf), [See the code](https://github.com/wdc3iii/legged_gym_dev)


---

## Real-Time Balancing of Stability and Plasticity in Continual Learning Enables Adaptive Speed Estimation Controllers for Lower-Limb Prostheses

> “The essence of repression lies simply in turning something away, and keeping it at a distance, from the conscious.”  
> — *Freud, 1915, p. 147*

- **Institution**: <a href="https://www.epic.gatech.edu/" target="_blank">EPIC Lab</a>, Georgia Institute of Technology
- **Dates**: August 2023 - June 2024
- **Description**: This project is generalized entirely to any continual learning system, and just finds apt use in the control systems of transfemoral prostheses, which is what I apply it to. In continual learning systems, there is a persistent issue of the stability (ability to retain generalizations from old data) and the plasticity (ability to learn from new data) of a network. Until now, there were only mitigation techniques on each side of this dynamic proposed. I developed a system that functionally controls the balance between stability and plasticity in real-time and dynamically modifies that balance based on error-wise optimization.
- **Award**: Presidential Undergraduate Research Award 2024
- **Publication**: Submitted to *Transactions on Medical Robotics & Bionics*
- **Links**: [Read the paper](https://portfolio.colebjohnson.com/research/stabilityplasticity.pdf)

---

## Real-time Adaptation of Deep Learning Walking Speed Estimators Enables Biomimetic Assistance Modulation in an Open-Source Bionic Leg

> Prosthetics learning to walk with users in real-time.

- **Institution**: <a href="https://www.epic.gatech.edu/" target="_blank">EPIC Lab</a>, Georgia Institute of Technology
- **Dates**: May 2022 - January 2024
- **Description**: This project is the real-time implementation and experimental evaluation of the previous system for prosthetic adaptation. We train deep learning subject-independent speed estimator models and iteratively fine-tune them through walking trials with transfemoral amputee subjects.
- **Publication**: Accepted to *Transactions on Medical Robotics & Bionics*
- **Links**: [Read the paper](https://portfolio.colebjohnson.com/research/adaptation.pdf), [See the code](https://github.gatech.edu/epicprosthetics/ALTAIR)

---

## Transfer Learning for Efficient Walking Speed Estimation Across Novel Prosthetic Devices and Populations

> Optimizing prosthetic performance by transferring learned knowledge across devices.

- **Institution**: <a href="https://www.epic.gatech.edu/" target="_blank">EPIC Lab</a>, Georgia Institute of Technology
- **Dates**: January 2023 – July 2023
- **Description**: It's become clear that deep learning controllers are the best for speed estimation in transfemoral prosthetics. But experimentally collecting sufficient data for the models to be highly performant is very costly. Thus, we wish to avoid repeatedly doing this for all different prosthetics. In this method, we enable foundational models to be trained with large amounts of data and the resulting controllers to be effectively transferred between devices.
- **Publication**: Submitted to *ICRA 2025*
- **Links**: [Read the paper](https://portfolio.colebjohnson.com/research/transfer.pdf)

---

## Accelerating Constrained Continual Learning with Dynamic Active Learning: A Study in Adaptive Speed Estimation for Lower-Limb Prostheses

> Optimizing the process of real-time prosthetic adaptation to users.

- **Institution**: <a href="https://www.epic.gatech.edu/" target="_blank">EPIC Lab</a>, Georgia Institute of Technology
- **Dates**: May 2023 - December 2023
- **Description**: Upon testing the adaptive pipeline which enables transfemoral prosthetics to learn users walking patterns in real-time (i.e. fine-tuning a subject-independent predictive model) using Temporal Convolutional Neural Networks (TCNs), we realized that the networks could not fine-tune fast enough. Thus, I used active learning methods (similar to query an oracle method) to select the most error-impactful datapoints to adapt on, thus speeding up the process.
- **Publication**: Published & Presented at *ISMR 2024*
- **Links**: [Read the paper](https://ieeexplore.ieee.org/document/10585934), [See the code](https://github.gatech.edu/epicprosthetics/pyLIRA)

---

## Adaptive Lower-Limb Prosthetic Control: Towards Personalized Intent Recognition & Context Estimation

> Personalizing prosthetic control for safer and more natural walking patterns.

- **Institution**: <a href="https://www.epic.gatech.edu/" target="_blank">EPIC Lab</a>, Georgia Institute of Technology
- **Dates**: December 2022 - May 2023
- **Description**: This was a pilot project that looked at the offline results of a pipeline that I wrote to compare different learning-based approaches for intent recognition (walking mode) and context estimation (speed &slope) as well as enable real-time fine-tuning of the models based on the user's current walking patterns.
- **Publication**: Published & Presented at *ISMR 2023*
- **Links**: [Read the paper](https://ieeexplore.ieee.org/document/10130251), [See the code](https://github.gatech.edu/epicprosthetics/pyLIRA)

---

## Generative Networks for Biomechanical Data Synthesis to Augment Deep Learning Datasets

> Enhancing prosthetic control with synthetic data to reduce the cost of real-world experimentation.

- **Institution**: <a href="https://www.epic.gatech.edu/" target="_blank">EPIC Lab</a>, Georgia Institute of Technology
- **Dates**: February 2022 - June 2022 
- **Description**: Biomechanical data is very expensive to attain both in cost of experimentation and post-processing and deep learning-based controllers, as the lab generally uses for intent recognition and context estimation in prosthetic controllers require very large datasets. Thus, I explored the use of Generative Adversarial Networks (GANs) and Variational Autoencoder Networks (VAEs) to synthetically produce novel biomechanical data based on real experimental data.
- **Award**: Presidential Undergraduate Research Award 2022
- **Links**: [Read a Short Report](https://portfolio.colebjohnson.com/research/gans.pdf)

---

## Artificial Potential Fields for Human-in-the-Loop Exoskeleton Controllers

> Guiding human movement with intuitive, resistance-based control for exoskeletons.

- **Institution**: DART Labs, Georgia Institute of Technology
- **Dates**: April 2021 - February 2022
- **Description**: This project attempted to use Artificial Potential Fields (APFs) to guide exoskeleton users through obstacle-dense environments by increasing biomechanical resistence to deviation from intended paths. I used Unity for simulation development, C# for algorithm implementation, and Python/C for hardware integration.