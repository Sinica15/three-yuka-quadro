import {forRender} from "./types";
import * as THREE from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import {entityManager, time} from "./index";

export function startAnimate(forRender: forRender) {
    const { renderer, labelRenderer, scene, camera } = forRender;
    function animate() {
        requestAnimationFrame(animate);
        const delta = time.update().getDelta();

        // camera.position.x = Math.sin(time.getElapsed()) * 10 + 40;
        // camera.position.z = Math.cos(time.getElapsed()) * 10;
        // camera.lookAt(scene.position);

        entityManager.update(delta);
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    }
    animate();
}

export function initRendering(): forRender {
    let renderer: THREE.WebGLRenderer;
    let labelRenderer: CSS2DRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;

    //setting scene
    scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 0).normalize();
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(200, 50);
    scene.add(gridHelper);

    //setting mount point
    const mountPoint = document.getElementById('three-mount');
    const width = mountPoint.offsetWidth;
    const height = mountPoint.offsetHeight;

    //setting camera
    camera = new THREE.PerspectiveCamera(
        60,
        width / height,
        0.1,
        1000
    );
    camera.position.set(0, 200, 10);
    camera.lookAt(0, 0, 10);

    //setting renderer

    window.addEventListener( 'resize', () => {
        // console.log(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize( width, height );
        labelRenderer.setSize( width, height );
    });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    mountPoint.appendChild(renderer.domElement);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize( width, height );
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    mountPoint.appendChild( labelRenderer.domElement );

    return { renderer, labelRenderer, scene, camera };
}