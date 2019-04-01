import { http } from "./config";

class AuthService {
  private project: string = "";
  private token: string = "";

  public Login (user: {}) {
    return http.post("auth/login", user);
  }
  public Register (identification: string) {
    return http.post("auth/data", { identification: identification });
  }
  public Login2 (user: {}) {
    return http.post("auth/login", user).then(res => {
      var response:any = res.data;
      this.token = response.token;
      localStorage.setItem('aio-token', response.token);
      console.log('Token gerado ' + response.token)
      return true;
    }, err => {
      console.log('Error');
      console.log(err);
    });
  }
  public setProject(project: string) {
    this.project = project;
    localStorage.setItem('aio-selected-project', project);
  }
  public getToken(): string {
    if (!this.token)
      this.token = localStorage.getItem('aio-token') || '';
    return this.token;
  }

  public getProject(): string {
    if (!this.project)
      this.project = localStorage.getItem('aio-selected-project') || '';
    return this.project;
  }

  public getUserDetails(): {email?: string} {
    const token = this.getToken();
    let payload;
    if (token) {
      payload = token.split('.')[1];
      payload = window.atob(payload);
      return JSON.parse(payload);
    } else {
      return {};
    }
  }

  public isLoggedIn(): boolean {
    const user = <any> this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  public isAdmin(): boolean {
    const user = <any> this.getUserDetails();
    if (user && user.role == 'administrator') {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  public logout(): void {
    this.token = "";
    localStorage.removeItem('aio-token');
  }
};

export default new AuthService();