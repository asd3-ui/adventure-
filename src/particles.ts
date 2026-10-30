/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ParticleType =
  | "dust"
  | "wall_spark"
  | "player_trail"
  | "beast_smoke"
  | "key_burst"
  | "portal_aura";

export interface Particle {
  active: boolean;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  secondaryColor?: string;
  rotation: number;
  vRot: number;
  drag: number;
  gravity: number;
  waveOffset: number;
}

const MAX_PARTICLES = 600;

export class ParticleEngine {
  private pool: Particle[];
  private nextIdx: number = 0;

  constructor() {
    this.pool = new Array(MAX_PARTICLES);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.pool[i] = {
        active: false,
        type: "dust",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        maxSize: 2,
        alpha: 1,
        life: 0,
        maxLife: 1,
        color: "#ffffff",
        rotation: 0,
        vRot: 0,
        drag: 0.98,
        gravity: 0,
        waveOffset: Math.random() * Math.PI * 2,
      };
    }
  }

  public clear(): void {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.pool[i].active = false;
    }
    this.nextIdx = 0;
  }

  private allocate(): Particle {
    const p = this.pool[this.nextIdx];
    this.nextIdx = (this.nextIdx + 1) % MAX_PARTICLES;
    p.active = true;
    return p;
  }

  /**
   * Ambient dust motes floating in the air for atmosphere
   */
  public emitDustMote(
    worldX: number,
    worldY: number,
    color: string,
    duration: number = 3.5
  ): void {
    const p = this.allocate();
    p.type = "dust";
    p.x = worldX + (Math.random() - 0.5) * 12;
    p.y = worldY + (Math.random() - 0.5) * 12;
    p.vx = (Math.random() - 0.5) * 8;
    p.vy = -Math.random() * 8 - 2;
    p.size = Math.random() * 2.2 + 1.2;
    p.maxSize = p.size;
    p.alpha = 0;
    p.life = duration;
    p.maxLife = duration;
    p.color = color;
    p.rotation = Math.random() * Math.PI * 2;
    p.vRot = (Math.random() - 0.5) * 1.5;
    p.drag = 0.99;
    p.gravity = -1.2; // slight upward thermal draft
    p.waveOffset = Math.random() * Math.PI * 2;
  }

  /**
   * High-velocity sparks when the player hits a wall
   */
  public emitWallSparks(
    worldX: number,
    worldY: number,
    normalX: number,
    normalY: number,
    count: number = 8,
    color: string = "#facc15"
  ): void {
    for (let i = 0; i < count; i++) {
      const p = this.allocate();
      p.type = "wall_spark";
      p.x = worldX;
      p.y = worldY;

      // Base direction along bounce normal with wide scatter
      const angle = Math.atan2(normalY, normalX) + (Math.random() - 0.5) * 1.4;
      const speed = Math.random() * 120 + 40;

      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = Math.random() * 2.5 + 1.5;
      p.maxSize = p.size;
      p.alpha = 1.0;
      p.life = Math.random() * 0.28 + 0.15;
      p.maxLife = p.life;
      p.color = Math.random() > 0.4 ? color : "#ffffff";
      p.rotation = angle;
      p.vRot = (Math.random() - 0.5) * 10;
      p.drag = 0.88;
      p.gravity = 90; // sparks arch downward
      p.waveOffset = 0;
    }
  }

  /**
   * Glimmer trail that follows the player as they move/sprint
   */
  public emitPlayerGlimmer(
    worldX: number,
    worldY: number,
    isSprinting: boolean = false
  ): void {
    const p = this.allocate();
    p.type = "player_trail";
    // Slightly behind the center
    p.x = worldX + (Math.random() - 0.5) * 8;
    p.y = worldY + (Math.random() - 0.5) * 8;
    p.vx = (Math.random() - 0.5) * 12;
    p.vy = (Math.random() - 0.5) * 12;
    p.size = isSprinting ? Math.random() * 3.5 + 2.0 : Math.random() * 2.2 + 1.0;
    p.maxSize = p.size;
    p.alpha = isSprinting ? 0.95 : 0.75;
    p.life = isSprinting ? 0.38 : 0.28;
    p.maxLife = p.life;
    p.color = isSprinting ? "#fbbf24" : "#22d3ee";
    p.secondaryColor = isSprinting ? "#f59e0b" : "#38bdf8";
    p.rotation = Math.random() * Math.PI * 2;
    p.vRot = (Math.random() - 0.5) * 5;
    p.drag = 0.94;
    p.gravity = 0;
    p.waveOffset = 0;
  }

  /**
   * Smoke & ember sparks when the beast moves or stalks
   */
  public emitBeastSmoke(
    worldX: number,
    worldY: number,
    beastAngle: number,
    smokeColors: string[] = ["rgba(239, 68, 68, 0.7)", "rgba(153, 27, 27, 0.5)"]
  ): void {
    const count = 2;
    for (let i = 0; i < count; i++) {
      const p = this.allocate();
      p.type = "beast_smoke";
      // Emitters behind the beast's movement direction
      const trailAngle = beastAngle + Math.PI + (Math.random() - 0.5) * 1.0;
      const offsetDist = Math.random() * 12 + 4;
      p.x = worldX + Math.cos(trailAngle) * offsetDist;
      p.y = worldY + Math.sin(trailAngle) * offsetDist;

      const speed = Math.random() * 25 + 10;
      p.vx = Math.cos(trailAngle) * speed + (Math.random() - 0.5) * 10;
      p.vy = Math.sin(trailAngle) * speed + (Math.random() - 0.5) * 10;

      p.size = Math.random() * 5 + 3;
      p.maxSize = p.size * 2.4; // puffs expand as they fade
      p.alpha = 0.8;
      p.life = Math.random() * 0.45 + 0.25;
      p.maxLife = p.life;
      p.color = smokeColors[Math.floor(Math.random() * smokeColors.length)];
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 3;
      p.drag = 0.92;
      p.gravity = -8; // heat rises
      p.waveOffset = 0;
    }
  }

  /**
   * Massive radial burst when the player collects a key
   */
  public emitKeyBurst(
    worldX: number,
    worldY: number,
    keyColor: string = "#f59e0b",
    count: number = 28
  ): void {
    for (let i = 0; i < count; i++) {
      const p = this.allocate();
      p.type = "key_burst";
      p.x = worldX;
      p.y = worldY;

      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 140 + 60;

      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = Math.random() * 4 + 2;
      p.maxSize = p.size;
      p.alpha = 1.0;
      p.life = Math.random() * 0.6 + 0.4;
      p.maxLife = p.life;
      p.color = Math.random() > 0.3 ? keyColor : "#ffffff";
      p.secondaryColor = "#fef08a";
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 8;
      p.drag = 0.91;
      p.gravity = 25;
      p.waveOffset = 0;
    }
  }

  /**
   * Swirling vortex motes around the active exit portal
   */
  public emitPortalAura(
    portalX: number,
    portalY: number,
    portalColor: string = "#10b981"
  ): void {
    const p = this.allocate();
    p.type = "portal_aura";
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 22 + 10;
    p.x = portalX + Math.cos(angle) * radius;
    p.y = portalY + Math.sin(angle) * radius;

    // Spiral inward tangent velocity
    const speed = Math.random() * 30 + 20;
    p.vx = -Math.sin(angle) * speed - Math.cos(angle) * 15;
    p.vy = Math.cos(angle) * speed - Math.sin(angle) * 15;

    p.size = Math.random() * 3 + 1.5;
    p.maxSize = p.size;
    p.alpha = 0.85;
    p.life = Math.random() * 0.5 + 0.3;
    p.maxLife = p.life;
    p.color = portalColor;
    p.secondaryColor = "#ffffff";
    p.rotation = angle;
    p.vRot = 2;
    p.drag = 0.96;
    p.gravity = 0;
    p.waveOffset = 0;
  }

  /**
   * Updates all active particles by dt
   */
  public update(dt: number): void {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      // Physics integration
      p.vx *= p.drag;
      p.vy = (p.vy + p.gravity * dt) * p.drag;
      p.rotation += p.vRot * dt;

      // Specialized movement
      if (p.type === "dust") {
        // Floating wave drift
        p.waveOffset += dt * 2.5;
        p.x += (p.vx + Math.sin(p.waveOffset) * 4) * dt;
        p.y += p.vy * dt;

        // Smooth fade-in then fade-out
        const progress = 1 - p.life / p.maxLife;
        if (progress < 0.25) {
          p.alpha = progress / 0.25;
        } else {
          p.alpha = Math.max(0, p.life / (p.maxLife * 0.75));
        }
      } else if (p.type === "beast_smoke") {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Expand and fade
        const progress = 1 - p.life / p.maxLife;
        p.size = p.maxSize * (0.4 + 0.6 * progress);
        p.alpha = Math.max(0, (p.life / p.maxLife) * 0.8);
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha = Math.max(0, p.life / p.maxLife);
      }
    }
  }

  /**
   * Renders all active particles using pure Canvas 2D vector calls
   * Strictly Zero-Font compliant.
   */
  public render(
    ctx: CanvasRenderingContext2D,
    viewBounds?: { minX: number; maxX: number; minY: number; maxY: number }
  ): void {
    ctx.save();

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.pool[i];
      if (!p.active || p.alpha <= 0.01) continue;

      // Fast AABB culling if viewport provided
      if (viewBounds) {
        if (
          p.x < viewBounds.minX - 30 ||
          p.x > viewBounds.maxX + 30 ||
          p.y < viewBounds.minY - 30 ||
          p.y > viewBounds.maxY + 30
        ) {
          continue;
        }
      }

      ctx.globalAlpha = p.alpha;

      if (p.type === "wall_spark") {
        // High-speed elongated spark line
        const tailX = p.x - p.vx * 0.04;
        const tailY = p.y - p.vy * 0.04;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // White hot tip
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "key_burst") {
        // Diamond 4-point star glint
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const r = p.size * 1.5;
        const inner = r * 0.3;
        ctx.moveTo(0, -r);
        ctx.lineTo(inner, -inner);
        ctx.lineTo(r, 0);
        ctx.lineTo(inner, inner);
        ctx.lineTo(0, r);
        ctx.lineTo(-inner, inner);
        ctx.lineTo(-r, 0);
        ctx.lineTo(-inner, -inner);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (p.type === "beast_smoke") {
        // Soft shadowy puff
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "player_trail") {
        // Glimmer spark
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Ambient dust mote / portal aura dot
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

export const particleEngine = new ParticleEngine();
