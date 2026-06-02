import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import cm



def r(X, a_1, a_2, b):
    u, d = X
    return np.where(d <= 4000, a_1 * d * (1 + b * u), a_2 * (1 + b * u))
    

u = np.array([1,2,3,1,2,3,1,2,3])
d = np.array([0,0,0,1000,1000,1000,4001,4001,4001])
X = (u,d)
r_values = np.array([0,0,0,0.1,0.15,0.2,0.3,0.45,0.6])


popt,pcov = curve_fit(r,X,r_values)
a_1,a_2,b = popt


print(f"a_1 = {a_1}")
print(f"a_2 = {a_2}")
print(f"b = {b}")

#作图
u_p = np.linspace(1, 3, 100)
d_p = np.linspace(0, 4000, 100)
u_grid, d_grid = np.meshgrid(u_p, d_p)
r_p = r((u_grid,d_grid), a_1, a_2, b)


fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')
surf = ax.plot_surface(u_grid, d_grid, r_p, cmap=cm.viridis, edgecolor='none')
fig.colorbar(surf, shrink=0.5, aspect=5)


ax.set_xlabel('u', fontsize=12, labelpad=10)
ax.set_ylabel('d', fontsize=12, labelpad=10)
ax.set_zlabel('r', fontsize=12, labelpad=10)
ax.set_title('3D Surface Plot of r(u,d)', fontsize=16)

ax.view_init(elev=20, azim=30)


plt.tight_layout()
plt.show()


import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import cm



def q_(x, c_1, c_2, c_3):
    u, V = x
    return c_1 * (u + c_2) * (np.log10(V) + c_3)


u = np.array([1, 2, 3, 1, 2, 3, 1, 2, 3])
V = np.array([10**5, 10**5, 10**5, 10**6, 10**6, 10**6, 10**7, 10**7, 10**7])
q_values = np.array([8.4, 10.8, 13.2, 10.5, 13.5, 16.5, 12.6, 16.2, 19.8])
xdata = (u, V)

# 初始猜测值
initial_guess = [1, 1, 1]

# 进行曲线拟合
popt, pcov = curve_fit(q_, xdata, q_values, p0=initial_guess)

c_1, c_2, c_3 = popt

print(f"c_1 = {c_1}")
print(f"c_2 = {c_2}")
print(f"c_3 = {c_3}")

#作图
U_p = np.linspace(1, 3, 100)
V_p = np.linspace(10**5, 10**7, 100)
U_grid, V_grid = np.meshgrid(U_p, V_p)
q_p = q_((U_grid,V_grid), c_1, c_2, c_3)


fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')
surf = ax.plot_surface(U_grid, V_grid, q_p, cmap=cm.viridis, edgecolor='none')
fig.colorbar(surf, shrink=0.5, aspect=5)


ax.set_xlabel('U', fontsize=12, labelpad=10)
ax.set_ylabel('V', fontsize=12, labelpad=10)
ax.set_zlabel('q', fontsize=12, labelpad=10)
ax.set_title('3D Surface Plot of q(U, V)', fontsize=16)

ax.view_init(elev=20, azim=30)


plt.tight_layout()
plt.show()