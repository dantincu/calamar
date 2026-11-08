# Friction, drag and circular motion

## Friction

When two surfaces press together, **friction** resists sliding. The simple model (Amontons and Coulomb, 17th–18th centuries) says it is proportional to the normal force $N$:

- **static** friction holds an object still, up to a maximum $f_s \le \mu_s N$;
- **kinetic** friction acts once it slides: $f_k = \mu_k N$, usually a little smaller.

| Surfaces | $\mu_s$ | $\mu_k$ |
|---|---|---|
| rubber on dry asphalt | about 0.9 | about 0.7 |
| rubber on wet asphalt | about 0.5–0.6 | about 0.4–0.5 |
| wood on wood | 0.25–0.5 | about 0.2 |
| steel on ice | about 0.03 | about 0.01 |

That is why it is harder to start pushing a heavy box than to keep it moving, and why anti-lock brakes help: a rolling tyre grips with static friction, a skidding one only with kinetic.

## The inclined plane

On a slope at angle $\theta$, split the weight into a part along the slope, $mg\sin\theta$, and a part into it, $mg\cos\theta$. The normal force balances the second, so $N = mg\cos\theta$. The object stays still if static friction can hold the first:

$$
mg\sin\theta \le \mu_s\, mg\cos\theta \quad\Longleftrightarrow\quad \tan\theta \le \mu_s
$$

The mass cancels. To measure $\mu_s$, tilt a board until the object starts to slide: $\mu_s = \tan\theta$. Once it slides, it accelerates at $a = g(\sin\theta - \mu_k\cos\theta)$.

## Drag and terminal speed

In air or water, **drag** grows with speed (the projectiles page used $F_D = \frac12\rho C_d A v^2$). A falling object speeds up until drag equals its weight, and then falls at a constant **terminal speed**:

$$
mg = \tfrac12 \rho C_d A v_t^2 \quad\Rightarrow\quad v_t = \sqrt{\frac{2mg}{\rho C_d A}}
$$

A skydiver falling belly-down reaches about 55 m/s (200 km/h); head-down, with a smaller area, about 80 m/s or more; with the parachute open, about 5 m/s. The baseball of the projectiles page has a terminal speed of about 40 m/s. Small things fall slowly: mass grows with the cube of size, area with the square, so $v_t$ grows with the square root of size. A mouse can survive falls that would kill a human, and dust and fog droplets barely fall at all.

## Circular motion

An object moving in a circle at constant speed is **accelerating**, because its velocity keeps changing direction. The acceleration points toward the center, the **centripetal** acceleration:

$$
a_c = \frac{v^2}{r} = \omega^2 r
$$

where $\omega$ is the angular speed in radians per second ($v = \omega r$). So by the second law, something must supply an inward net force $F = mv^2/r$: a string's tension for a whirled stone, friction for a car on a bend, gravity for the Moon.

**Example: a car on a flat bend.** Friction provides the centripetal force, at most $\mu_s mg$, so the car holds the road while:

$$
\frac{mv^2}{r} \le \mu_s m g \quad\Rightarrow\quad v_{\max} = \sqrt{\mu_s g r}
$$

For a bend of radius 50 m on dry asphalt ($\mu_s = 0.9$): $v_{\max} = \sqrt{0.9 \times 9.81 \times 50} = 21$ m/s, about 75 km/h. On wet asphalt ($\mu_s = 0.5$), 16 m/s, about 56 km/h. Again the mass cancels: a truck and a car have the same limit (in this model).

**There is no "centrifugal force" pushing you out.** In a turning car you feel pressed outward because your body tends to go straight (the first law), while the car turns under you. In the car's rotating frame of reference, it is convenient to describe this with a fictitious outward force, but in the ground frame, there is only the inward force of the door or seat pushing you round.

**Example: a loop-the-loop.** At the top of a vertical loop of radius $r$, both gravity and the track push down. The minimum speed to stay on the track is when the track's force falls to zero and gravity alone provides the centripetal force: $mg = mv^2/r$, so $v_{\min} = \sqrt{gr}$. For a 10 m loop radius, 9.9 m/s.

## Check yourself

1. A 20 kg box needs a push of 80 N to start moving on a floor. What is $\mu_s$?
2. Show that on a frictionless slope, an object accelerates at $g\sin\theta$. How long does it take to slide 10 m down a 30° slope?
3. A satellite in a low orbit travels at 7.7 km/s, 6,770 km from the Earth's center. What is its centripetal acceleration? Compare with $g$ at the surface. (The gravitation chapter returns to this.)
