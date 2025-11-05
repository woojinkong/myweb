package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public void updateProfileImage(Long userNo, String imagePath) {
        Optional<User> optionalUser = userRepository.findById(userNo);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setProfileImage(imagePath);
            userRepository.save(user);
        }
    }

    public User updateUserInfo(Long userNo, User updatedInfo) {
    return userRepository.findById(userNo).map(user -> {
        if (updatedInfo.getUserName() != null) user.setUserName(updatedInfo.getUserName());
        if (updatedInfo.getEmail() != null) user.setEmail(updatedInfo.getEmail());
        if (updatedInfo.getPhone() != null) user.setPhone(updatedInfo.getPhone());
        return userRepository.save(user);
    }).orElseThrow(() -> new RuntimeException("User not found"));
}

}
