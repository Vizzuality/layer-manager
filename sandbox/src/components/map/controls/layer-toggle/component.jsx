import React from 'react';
import './styles.scss'

function LayerToggle({layers, setLayers}) {
  return (
    <div className="c-layer-toggle">
      {layers && layers.map((l, i) =>
        <p>
          Layer {i+1}
          <input
            type="checkbox"
            checked={l.active}
            onChange={() =>
              setLayers(layers.map(layer =>
                layer.id !== l.id ?
                layer :
                {...l, active: !l.active}
              ))
            }></input>
        </p>
      )}
    </div>
  );
}

export default LayerToggle;