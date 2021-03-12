type SuccessStatus =
  | {
      status: 200;
    }
  | {
      status: 201;
    }
  | {
      status: 202;
    }
  | {
      status: 204;
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResponseMessage<T extends { status: number; data: any }> =
  | (Extract<T, SuccessStatus> & {
      success: true;
    })
  | (Exclude<T, SuccessStatus> & {
      success: false;
    });
