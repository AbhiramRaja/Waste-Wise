import { useState, useEffect, useRef } from 'react';
import './ConveyorSimulation.css';

// Import images
import plasticBottleImg from '/assets/waste/plastic_bottle.png';
import plasticBagImg from '/assets/waste/plastic_bag.png';
import paperImg from '/assets/waste/paper.png';

const ConveyorSimulation = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const imagesRef = useRef({});
    const isRunningRef = useRef(false); // Track running state for animation loop
    const mainBeltObjectsRef = useRef([]); // Track main belt objects for drawing
    const inspectionBeltObjectsRef = useRef([]); // Track inspection belt objects for drawing

    const [isRunning, setIsRunning] = useState(false);
    const [mainBeltObjects, setMainBeltObjects] = useState([]);
    const [inspectionBeltObjects, setInspectionBeltObjects] = useState([]);
    const [stats, setStats] = useState({
        totalProcessed: 0,
        diverted: 0,
        cleaned: 0,
        scrapped: 0,
        recovered: 0,
        recoveryPercentage: 100
    });
    const [events, setEvents] = useState([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    // Canvas dimensions
    const CANVAS_WIDTH = 1400;
    const CANVAS_HEIGHT = 600;
    const MAIN_BELT_Y = 150;
    const INSPECTION_BELT_Y = 400;
    const OBJECT_SPEED = 1.2; // Slower speed to keep more items visible
    const INSPECTION_SCAN_DURATION = 3000; // 3 seconds for deep scan

    // Clean recyclables (constant flow on main belt)
    const RECYCLABLES = [
        { type: 'plastic_bottle', imageSrc: plasticBottleImg, name: 'Plastic Bottle', color: '#4CAF50', size: 50 },
        { type: 'plastic_bag', imageSrc: plasticBagImg, name: 'Plastic Bag', color: '#4CAF50', size: 45 },
        { type: 'paper', imageSrc: paperImg, name: 'Paper', color: '#4CAF50', size: 48 },
        { type: 'cardboard', emoji: '📦', name: 'Cardboard', color: '#4CAF50', size: 45 },
        { type: 'metal', emoji: '🥫', name: 'Metal Scrap', color: '#4CAF50', size: 40 },
        { type: 'glass', emoji: '🍶', name: 'Glass Bottle', color: '#4CAF50', size: 40 },
        { type: 'food_scraps', emoji: '🥬', name: 'Food Scraps', color: '#4CAF50', size: 42 },
        { type: 'textiles', emoji: '👕', name: 'Textiles', color: '#4CAF50', size: 40 },
        { type: 'yard_waste', emoji: '🍂', name: 'Yard Waste', color: '#4CAF50', size: 42 },
        { type: 'medical_ppe', emoji: '😷', name: 'Non-infectious PPE', color: '#4CAF50', size: 40 }
    ];

    // Hazardous contaminants
    const CONTAMINANTS = [
        { type: 'medical_gloves', emoji: '🧤', name: 'Soiled Gloves', color: '#FF5722', size: 40, severity: 'high' },
        { type: 'needles', emoji: '💉', name: 'Sharps/Needles', color: '#D32F2F', size: 40, severity: 'critical' },
        { type: 'chemicals', emoji: '🧪', name: 'Chemical Solvents', color: '#9C27B0', size: 40, severity: 'high' },
        { type: 'battery', emoji: '🔋', name: 'Batteries', color: '#FF9800', size: 40, severity: 'medium' },
        { type: 'biohazard', emoji: '☣️', name: 'Infectious Material', color: '#F44336', size: 40, severity: 'critical' },
        { type: 'pharma', emoji: '💊', name: 'Expired Pharmaceuticals', color: '#E91E63', size: 40, severity: 'high' }
    ];

    // Preload images
    useEffect(() => {
        const loadImages = async () => {
            const imagePromises = RECYCLABLES
                .filter(item => item.imageSrc)
                .map(item => {
                    return new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => {
                            imagesRef.current[item.type] = img;
                            resolve();
                        };
                        img.onerror = (err) => {
                            console.error(`Failed to load ${item.type}:`, err);
                            reject(err);
                        };
                        img.src = item.imageSrc;
                    });
                });

            try {
                await Promise.all(imagePromises);
                console.log('All images loaded successfully');
                setImagesLoaded(true);
            } catch (error) {
                console.error('Error loading images:', error);
                setImagesLoaded(true);
            }
        };

        loadImages();
    }, []);

    // Sync state to refs for animation loop
    useEffect(() => {
        mainBeltObjectsRef.current = mainBeltObjects;
    }, [mainBeltObjects]);

    useEffect(() => {
        inspectionBeltObjectsRef.current = inspectionBeltObjects;
    }, [inspectionBeltObjects]);

    // Spawn clean recyclable (with occasional contamination)
    const spawnRecyclable = () => {
        const template = RECYCLABLES[Math.floor(Math.random() * RECYCLABLES.length)];
        const isContaminated = Math.random() < 0.1; // 10% chance of contamination

        const item = {
            id: Date.now() + Math.random(),
            ...template,
            x: 0,
            y: MAIN_BELT_Y,
            velocity: OBJECT_SPEED,
            state: 'moving', // moving, diverting, inspecting, returning, scrapping
            contaminated: isContaminated
        };

        // Add contaminant if contaminated
        if (isContaminated) {
            const contaminant = CONTAMINANTS[Math.floor(Math.random() * CONTAMINANTS.length)];
            item.contaminant = contaminant;
            item.canBeCleaned = Math.random() > 0.3; // 70% chance it can be cleaned
            addEvent(`⚠️ Contaminated ${template.name} detected (${contaminant.name})`);
        }

        return item;
    };



    // Add event to log
    const addEvent = (message) => {
        setEvents(prev => [
            { id: Date.now(), message, time: new Date().toLocaleTimeString() },
            ...prev.slice(0, 5)
        ]);
    };

    // Animation loop
    const animate = () => {
        if (!isRunningRef.current) return; // Use ref instead of state

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw main belt (moving)
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(0, MAIN_BELT_Y - 30, CANVAS_WIDTH, 80);

        // Animated belt lines
        const lineOffset = (Date.now() / 20) % 40;
        ctx.strokeStyle = '#34495E';
        ctx.lineWidth = 2;
        for (let i = -40; i < CANVAS_WIDTH; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i + lineOffset, MAIN_BELT_Y - 30);
            ctx.lineTo(i + lineOffset, MAIN_BELT_Y + 50);
            ctx.stroke();
        }

        // Draw inspection belt (static)
        ctx.fillStyle = '#34495E';
        ctx.fillRect(200, INSPECTION_BELT_Y - 30, 800, 80);

        // Static belt pattern
        ctx.strokeStyle = '#455A64';
        ctx.lineWidth = 2;
        for (let i = 200; i < 1000; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, INSPECTION_BELT_Y - 30);
            ctx.lineTo(i, INSPECTION_BELT_Y + 50);
            ctx.stroke();
        }

        // Draw inspection zone label
        ctx.fillStyle = '#FFC107';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('🔬 STATIC INSPECTION & CLEANING ZONE', 220, INSPECTION_BELT_Y - 40);

        // Draw AI Detection Zone on main belt
        const AI_DETECTION_X = 625; // Center of detection zone (600-650)

        // Vertical detection line with glow
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00E5FF';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(AI_DETECTION_X, MAIN_BELT_Y - 50);
        ctx.lineTo(AI_DETECTION_X, MAIN_BELT_Y + 70);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Scanning beam effect (animated)
        const scanPulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(0, 229, 255, ${scanPulse * 0.15})`;
        ctx.fillRect(AI_DETECTION_X - 25, MAIN_BELT_Y - 50, 50, 120);

        // AI Detection label
        ctx.fillStyle = '#00E5FF';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('🤖 AI SCANNER', AI_DETECTION_X - 50, MAIN_BELT_Y - 55);
        ctx.font = '11px Arial';
        ctx.fillText('Detection Zone', AI_DETECTION_X - 40, MAIN_BELT_Y + 80);

        // Draw recycling exit
        ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
        ctx.fillRect(CANVAS_WIDTH - 150, MAIN_BELT_Y - 50, 150, 120);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        ctx.strokeRect(CANVAS_WIDTH - 150, MAIN_BELT_Y - 50, 150, 120);
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('✅ RECYCLING', CANVAS_WIDTH - 130, MAIN_BELT_Y);
        ctx.fillText('EXIT', CANVAS_WIDTH - 100, MAIN_BELT_Y + 20);

        // Draw scrap bin
        ctx.fillStyle = 'rgba(244, 67, 54, 0.3)';
        ctx.fillRect(1050, INSPECTION_BELT_Y + 80, 150, 100);
        ctx.strokeStyle = '#F44336';
        ctx.lineWidth = 3;
        ctx.strokeRect(1050, INSPECTION_BELT_Y + 80, 150, 100);
        ctx.fillStyle = '#F44336';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('🗑️ SCRAP BIN', 1070, INSPECTION_BELT_Y + 135);

        // Update main belt objects
        setMainBeltObjects(prev => {
            return prev.map(obj => {
                let newObj = { ...obj };

                // Check if contaminated item should divert to inspection
                if (newObj.contaminated && newObj.x > 600 && newObj.x < 650 && newObj.state === 'moving') {
                    newObj.state = 'diverting';
                    addEvent(`🔻 Diverting ${newObj.name} to inspection belt`);
                }

                // Handle different states
                if (newObj.state === 'moving') {
                    newObj.x += newObj.velocity;
                } else if (newObj.state === 'diverting') {
                    // Move down to inspection belt
                    newObj.y += 4;
                    newObj.x += 1;
                    if (newObj.y >= INSPECTION_BELT_Y) {
                        newObj.y = INSPECTION_BELT_Y;
                        newObj.state = 'inspecting';
                        newObj.inspectionStartTime = Date.now();
                        newObj.inspectionX = 400 + Math.random() * 400; // Random position on inspection belt
                        setInspectionBeltObjects(prev => [...prev, newObj]);
                        addEvent(`🔬 Scanning ${newObj.name} for contamination...`);
                        return null; // Remove from main belt
                    }
                }

                // Remove if reached end
                if (newObj.x > CANVAS_WIDTH && newObj.state === 'moving') {
                    if (!newObj.contaminated) {
                        setStats(s => ({
                            ...s,
                            totalProcessed: s.totalProcessed + 1,
                            recovered: s.recovered + 1,
                            recoveryPercentage: Math.round(((s.recovered + 1) / (s.totalProcessed + 1)) * 100)
                        }));
                    }
                    return null;
                }

                return newObj;
            }).filter(Boolean);
        });

        // Update inspection belt objects
        setInspectionBeltObjects(prev => {
            return prev.map(obj => {
                let newObj = { ...obj };
                const now = Date.now();

                if (newObj.state === 'inspecting') {
                    const elapsed = now - newObj.inspectionStartTime;

                    // Deep scan animation (pulsing)
                    const scanProgress = (elapsed % 1000) / 1000;
                    newObj.scanPulse = scanProgress;

                    // After scan duration, decide fate
                    if (elapsed > INSPECTION_SCAN_DURATION) {
                        if (newObj.canBeCleaned) {
                            newObj.state = 'returning';
                            newObj.contaminated = false; // Cleaned!
                            addEvent(`✅ ${newObj.name} cleaned successfully - returning to main belt`);
                            setStats(s => ({
                                ...s,
                                diverted: s.diverted + 1,
                                cleaned: s.cleaned + 1
                            }));
                        } else {
                            newObj.state = 'scrapping';
                            addEvent(`❌ ${newObj.name} unsalvageable - sending to scrap`);
                            setStats(s => ({
                                ...s,
                                diverted: s.diverted + 1,
                                scrapped: s.scrapped + 1
                            }));
                        }
                    }
                } else if (newObj.state === 'returning') {
                    // Move back up to main belt
                    newObj.y -= 4;
                    newObj.x += 2;
                    if (newObj.y <= MAIN_BELT_Y) {
                        newObj.y = MAIN_BELT_Y;
                        newObj.state = 'moving';
                        newObj.x = 700; // Re-enter main belt after inspection
                        setMainBeltObjects(prev => [...prev, newObj]);
                        return null; // Remove from inspection belt
                    }
                } else if (newObj.state === 'scrapping') {
                    // Move to scrap bin (visible trajectory)
                    const targetX = 1150; // Center of scrap bin
                    const targetY = INSPECTION_BELT_Y + 130; // Into the bin

                    const dx = targetX - newObj.x;
                    const dy = targetY - newObj.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 5) {
                        // Move toward scrap bin
                        newObj.x += (dx / distance) * 4;
                        newObj.y += (dy / distance) * 4;
                    } else {
                        // Reached scrap bin
                        setStats(s => ({
                            ...s,
                            totalProcessed: s.totalProcessed + 1,
                            recoveryPercentage: Math.round((s.recovered / (s.totalProcessed + 1)) * 100) || 0
                        }));
                        return null; // Remove
                    }
                }

                return newObj;
            }).filter(Boolean);
        });

        // Draw main belt objects
        // Draw main belt objects (use ref for current state)
        mainBeltObjectsRef.current.forEach(obj => {
            drawObject(ctx, obj);
        });

        // Draw inspection belt objects
        // Draw inspection belt objects (use ref for current state)
        inspectionBeltObjectsRef.current.forEach(obj => {
            drawObject(ctx, obj);

            // Draw scanning effect
            if (obj.state === 'inspecting' && obj.scanPulse !== undefined) {
                const pulseSize = 20 + obj.scanPulse * 30;
                ctx.strokeStyle = `rgba(255, 193, 7, ${1 - obj.scanPulse})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(obj.inspectionX, obj.y, pulseSize, 0, Math.PI * 2);
                ctx.stroke();

                // Red horizontal scanning laser (sweeps up and down)
                const scanOffset = (obj.scanPulse * 80) - 40; // -40 to +40
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 3;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#FF0000';
                ctx.beginPath();
                ctx.moveTo(obj.inspectionX - 50, obj.y + scanOffset);
                ctx.lineTo(obj.inspectionX + 50, obj.y + scanOffset);
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Vertical yellow scanning beams from above
                ctx.strokeStyle = '#FFC107';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(obj.inspectionX - 40, obj.y - 60);
                ctx.lineTo(obj.inspectionX, obj.y - 20);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(obj.inspectionX + 40, obj.y - 60);
                ctx.lineTo(obj.inspectionX, obj.y - 20);
                ctx.stroke();
            }
        });

        // Draw diversion arrows
        ctx.fillStyle = '#FFC107';
        ctx.font = '24px Arial';
        ctx.fillText('↓', 620, MAIN_BELT_Y + 80);
        ctx.fillText('↑', 680, INSPECTION_BELT_Y - 60);

        animationRef.current = requestAnimationFrame(animate);
    };

    // Draw object helper
    const drawObject = (ctx, obj) => {
        const x = obj.state === 'inspecting' ? obj.inspectionX : obj.x;
        const y = obj.y;

        // Glow effect
        if (obj.contaminated && obj.state === 'moving') {
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#F44336';
        } else if (obj.state === 'inspecting') {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FFC107';
        } else if (obj.state === 'returning') {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#4CAF50';
        } else {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#4CAF50';
        }

        // Draw image or emoji
        if (obj.imageSrc && imagesRef.current[obj.type]) {
            const img = imagesRef.current[obj.type];
            const size = obj.size || 45;
            ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        } else if (obj.emoji) {
            ctx.font = `${obj.size}px Arial`;
            ctx.fillText(obj.emoji, x, y);
        }

        ctx.shadowBlur = 0;

        // Show contaminant indicator
        if (obj.contaminated && obj.contaminant && obj.state !== 'returning') {
            ctx.font = '20px Arial';
            ctx.fillText(obj.contaminant.emoji, x + 15, y - 15);
        }
    };

    // Start/stop simulation
    useEffect(() => {
        if (isRunning) {
            animationRef.current = requestAnimationFrame(animate);

            // Constant spawn of recyclables (some contaminated)
            const spawnInterval = setInterval(() => {
                setMainBeltObjects(prev => [...prev, spawnRecyclable()]);
            }, 400); // Spawn every 400ms to maintain 5-6 items on belt

            return () => {
                clearInterval(spawnInterval);
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
            };
        }
    }, [isRunning, imagesLoaded]);

    const handleStart = () => {
        setIsRunning(true);
        isRunningRef.current = true; // Update ref
        addEvent('✅ Dual-belt system started');
    };

    const handleStop = () => {
        setIsRunning(false);
        isRunningRef.current = false; // Update ref
        addEvent('⏸️ System paused');
    };

    const handleReset = () => {
        setIsRunning(false);
        setMainBeltObjects([]);
        setInspectionBeltObjects([]);
        setStats({
            totalProcessed: 0,
            diverted: 0,
            cleaned: 0,
            scrapped: 0,
            recovered: 0,
            recoveryPercentage: 100
        });
        setEvents([]);
        addEvent('🔄 System reset');
    };

    return (
        <div className="conveyor-simulation">
            <div className="simulation-header">
                <h1>🏭 AI-Powered Selective Recovery System</h1>
                <p>Dual-belt contamination detection with static deep inspection</p>
            </div>

            <div className="simulation-container">
                <div className="canvas-wrapper">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        className="simulation-canvas"
                    />

                    <div className="legend">
                        <div className="legend-item">
                            <span className="indicator green"></span>
                            <span>Clean Recyclables</span>
                        </div>
                        <div className="legend-item">
                            <span className="indicator red"></span>
                            <span>Contaminated (Diverted)</span>
                        </div>
                        <div className="legend-item">
                            <span className="indicator yellow"></span>
                            <span>Under Inspection</span>
                        </div>
                    </div>
                </div>

                <div className="control-panel">
                    <h3>🎮 Controls</h3>

                    <div className="buttons">
                        {!isRunning ? (
                            <button onClick={handleStart} className="btn btn-start">
                                ▶️ Start System
                            </button>
                        ) : (
                            <button onClick={handleStop} className="btn btn-stop">
                                ⏸️ Pause
                            </button>
                        )}



                        <button onClick={handleReset} className="btn btn-reset">
                            🔄 Reset
                        </button>
                    </div>

                    <div className="stats-panel">
                        <h3>📊 Statistics</h3>

                        <div className="stat-card">
                            <div className="stat-label">Total Processed</div>
                            <div className="stat-value">{stats.totalProcessed}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Diverted to Inspection</div>
                            <div className="stat-value warning">{stats.diverted}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Cleaned & Recovered</div>
                            <div className="stat-value success">{stats.cleaned}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Scrapped</div>
                            <div className="stat-value danger">{stats.scrapped}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Final Recovered</div>
                            <div className="stat-value success">{stats.recovered}</div>
                        </div>

                        <div className="stat-card highlight">
                            <div className="stat-label">Recovery Rate</div>
                            <div className="stat-value large">{stats.recoveryPercentage}%</div>
                        </div>
                    </div>

                    <div className="events-log">
                        <h3>📋 Event Log</h3>
                        <div className="events-list">
                            {events.length === 0 ? (
                                <div className="no-events">No events yet</div>
                            ) : (
                                events.map(event => (
                                    <div key={event.id} className="event-item">
                                        <span className="event-time">{event.time}</span>
                                        <span className="event-message">{event.message}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="info-panel">
                <h3>💡 How It Works</h3>
                <p>
                    <strong>Main Belt:</strong> Clean recyclables flow continuously to the recycling exit.
                    <br />
                    <strong>Detection:</strong> When contaminated waste is detected, it's diverted to the static inspection belt.
                    <br />
                    <strong>Deep Scan:</strong> The inspection belt performs detailed contamination analysis.
                    <br />
                    <strong>Selective Recovery:</strong> If contamination can be removed, the item is cleaned and returned to the main belt. Otherwise, it's scrapped.
                    <br />
                    <strong>Result:</strong> Up to 60% reduction in waste sent to landfills through targeted intervention.
                </p>
            </div>
        </div>
    );
};

export default ConveyorSimulation;
