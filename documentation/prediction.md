# Predictive Train Control
In order to offer short breaking-to-breaking distances, ACTS simulates all the trains and constantly updates the simulations with real positions using multiple sensors.
While simulation trains, each train has two faces: A head (front in driving direction) and a tail (end).
Both faces have a minimal distance, maximal distance and nominal distance.
- Minimal distance assumes that the train stopped because a huge rock brought it to an instant stop
- Maximal distance assumes that the train went into full throttle and accelerated as quickly as possible
- Nominal distance assumes that the train ran at the speed it was running at when last measured

Those locations are calculated based on the last reading within the train.

For example, we have a train consisting of a locomotive (A) and three coaches (B, C, D).
All of them have magnets attached (`+` and `-`).
They are running along a track (`=`) on section `(a)` with a magnetic sensor (`[+]` and `[-]`).

```
 [+ D -][- C +][+ B -][+ A -] →
(a===============================[+][-]==)(b========) ...

A = 10m
A- = 1m
A+ = 9m
A velocity = 10m/s
A max acceleration = 5m/s2
...

a = 150m
a+ = 90m
a- = 92m
```

When the negative magnet of `A` passes over the negative magnetic sensor, the last known head location of the train is set to:
Location of sensor in track (92m) + Location of the negative magnet on the A (1m) = 93m in a

After two second without any updates, reading the head location would return the following values:
- minimal location: 93m in a (last measured location)
- nominal location: 93m + 20m (10m/s velocity * 2s) = 113m
- maximal location: 93m + 20m + (5m/s2 max acceleration * 2s^2 / 2) = 123m