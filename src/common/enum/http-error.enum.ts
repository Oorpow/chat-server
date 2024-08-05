export enum HTTPERROR {
  USER_EXIST = '用户已存在',
  USER_NOT_EXIST = '用户不存在',
  USERNAME_OR_PASSWORD_ERROR = '用户名或密码错误',
  NO_LOGIN = '未登录',
  TOKEN_EXPIRED = 'token失效，请重新登录',
  FRIEND_ADD_ERROR = '好友添加失败',
  FRIEND_REJECT_ERROR = '拒绝好友申请失败',
  SINGLE_GROUP_JOIN_ERROR = '私聊无法加人',
  SINGLE_GROUP_QUIT_ERROR = '私聊无法退出',
}
