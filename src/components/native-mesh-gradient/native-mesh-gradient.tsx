import { type FC, type JSX, type ReactNode } from 'react';
import { processColor, type ProcessedColorValue } from 'react-native';

import { NativeMeshGradientView } from '../../core/native-mesh-gradient-view';
import { useStableValue } from '../../hooks';
import type { TPoint } from '../../interfaces';
import type { INativeMeshGradient } from '../../interfaces/native-mesh.interface';
import { assertNonNegative, invariant } from '../../utils/assert/assert.util';
import { createComponent } from '../../utils/component/create-component.util';

const MaximumSide = 16;

function toPair<T extends TPoint>(point: T): [number, number] {
  return 'x' in point ? [point.x, point.y] : [point[0], point[1]];
}
function isProcessed<T extends ProcessedColorValue>(color: T | null | undefined): color is T {
  return color !== null && color !== undefined;
}

const NativeMeshGradientComponent: FC<INativeMeshGradient> = ({
  columns = 2,
  rows = 2,
  points,
  colors,
  smoothsColors = true,
  background,
  colorSpace = 'device',
  animationDuration = 0,
  drift = 0,
  speed = 1,
  paused = false,
  ...props
}: INativeMeshGradient): ReactNode & JSX.Element => {
  invariant(
    Number.isInteger(columns) && columns >= 2 && columns <= MaximumSide,
    `NativeMeshGradient columns must be an integer from 2 to ${MaximumSide}, received ${columns}`
  );
  invariant(
    Number.isInteger(rows) && rows >= 2 && rows <= MaximumSide,
    `NativeMeshGradient rows must be an integer from 2 to ${MaximumSide}, received ${rows}`
  );
  invariant(colors.length > 0, 'NativeMeshGradient needs at least one color');
  invariant(
    points === undefined || points.length === columns * rows,
    `NativeMeshGradient expects ${columns * rows} points (columns × rows), received ${points?.length}`
  );
  assertNonNegative(animationDuration, 'NativeMeshGradient animationDuration');
  assertNonNegative(drift, 'NativeMeshGradient drift');

  const nativeColors = useStableValue(
    colors.map((color) => processColor(color)).filter(isProcessed<ProcessedColorValue>)
  );
  const nativePoints = useStableValue(points ? points.map(toPair<TPoint>) : []);
  const nativeBackground = useStableValue(
    background === undefined ? null : (processColor(background) ?? null)
  );

  return (
    <NativeMeshGradientView
      {...props}
      columns={columns}
      rows={rows}
      points={nativePoints}
      colors={nativeColors}
      smoothsColors={smoothsColors}
      background={nativeBackground}
      colorSpace={colorSpace}
      animationDuration={animationDuration}
      drift={drift}
      speed={speed}
      paused={paused}
    />
  );
};

const NativeMeshGradient = createComponent<INativeMeshGradient>(
  'NativeMeshGradient',
  NativeMeshGradientComponent
);

export { NativeMeshGradient };
