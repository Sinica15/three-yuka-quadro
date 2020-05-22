// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as THREE from 'three/build/three.module';

const vehicleGeometry = new THREE.ConeBufferGeometry(0.5, 2, 8);
// const vehicleGeometry = new THREE.TorusKnotGeometry(10, 1.3, 500, 60, 6, 20);
vehicleGeometry.rotateX(Math.PI * 0.5);
vehicleGeometry.computeBoundingSphere();

export default vehicleGeometry;
