import { Router, Response, Request } from 'express';
import { HTTP_STATUSES } from '../../shared/constants/http-statuses.js';
import { devicesService } from '../../application/services/devices.service.js';
import { refreshAuthMiddleware } from '../middlewares/refresh-auth.middleware.js';
import { ParamsDeviceId, RequestWithParams } from '../../shared/types/express-request.types.js';
import type { DeviceResponseDto, DeleteDeviceResult } from '../../application/dto/device.dto.js';

const router = Router();

router.get('/devices', refreshAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId: string = req.userId!;
    const devices: DeviceResponseDto[] = await devicesService.getUserDevices(userId);
    res.status(HTTP_STATUSES.OK).send(devices);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

router.delete('/devices', refreshAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const userId: string = req.userId!;
    const deviceId: string = req.deviceId;
    await devicesService.deleteOtherDevices(userId, deviceId);
    res.sendStatus(HTTP_STATUSES.NO_CONTENT);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

router.delete(
  '/devices/:deviceId',
  refreshAuthMiddleware,
  async (req: RequestWithParams<ParamsDeviceId>, res: Response) => {
    try {
      const userId: string = req.userId!;
      const { deviceId }: ParamsDeviceId = req.params;
      const result: DeleteDeviceResult = await devicesService.deleteDevice(deviceId, userId);

      if (result.notFound) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
      }

      if (result.forbidden) {
        return res.sendStatus(HTTP_STATUSES.FORBIDDEN);
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT);
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

export default router;
